// src/app/api/posts/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboarding: true,
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    let allPosts: any[] = [];

    // 1. POSTS DO CONTENT HUB (da tabela Post)
    const contentHubPosts = user.posts.map((post) => {
      // Parse platformData para extrair hook, cta, etc
      let extraData: any = {};
      try {
        if (post.platformData) {
          extraData = JSON.parse(post.platformData);
        }
      } catch (error) {
        console.error("Erro ao parsear platformData:", error);
      }

      const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];
      const hashtags = post.hashtags ? JSON.parse(post.hashtags) : [];

      return {
        id: post.id,
        title: extraData.hook || `Post ${post.type}`,
        caption: post.caption || "",
        type: post.type,
        status: post.status,
        image: mediaUrls[0] || post.thumbnailUrl || "",
        mediaUrls: mediaUrls,
        date: post.scheduledAt ? new Date(post.scheduledAt).toISOString().split("T")[0] : "",
        time: extraData.bestTimeToPost || "09:00",
        platform: "instagram",
        hashtags: hashtags,
        scheduledAt: post.scheduledAt,
        publishedAt: post.publishedAt,
        // Campos específicos do Content Hub (extraídos do platformData)
        hook: extraData.hook,
        cta: extraData.cta,
        estimatedEngagement: extraData.estimatedEngagement,
        bestTimeToPost: extraData.bestTimeToPost,
        imagePrompt: extraData.imagePrompt,
        isAiGenerated: post.isAiGenerated,
        createdAt: post.createdAt,
        source: "content-hub", // Para identificar a origem
      };
    });

    allPosts = [...contentHubPosts];

    // 2. POSTS DO ONBOARDING (se existirem)
    if (user.onboarding?.initialPosts) {
      try {
        const initialPosts = JSON.parse(user.onboarding.initialPosts);
        const onboardingPosts = initialPosts.map((post: any, index: number) => ({
          id: `onboarding-${index + 1}`,
          title: post.hook || post.title || `Post do Onboarding ${index + 1}`,
          caption: post.caption || post.content || "",
          type: post.type || "SINGLE",
          status: "DRAFT",
          image: post.imageUrl || post.thumbnailUrl || "",
          mediaUrls: post.imageUrl ? [post.imageUrl] : [],
          date: "",
          time: post.bestTimeToPost || "09:00",
          platform: "instagram",
          hashtags: post.hashtags || [],
          scheduledAt: null,
          publishedAt: null,
          hook: post.hook,
          cta: post.cta,
          estimatedEngagement: post.estimatedEngagement,
          bestTimeToPost: post.bestTimeToPost,
          mediaType: post.mediaType,
          source: "onboarding", // Para identificar a origem
        }));
        
        // Adicionar posts do onboarding no final
        allPosts = [...allPosts, ...onboardingPosts];
      } catch (error) {
        console.error("Erro ao parsear posts do onboarding:", error);
      }
    }

    return NextResponse.json({
      posts: allPosts,
      total: allPosts.length,
      contentHubCount: contentHubPosts.length,
      onboardingCount: allPosts.length - contentHubPosts.length,
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts", posts: [] },
      { status: 500 }
    );
  }
}

// POST com filtro por mês (para calendário)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { month } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboarding: true,
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ posts: [] });
    }

    let allPosts: any[] = [];

    // Posts do Content Hub
    const contentHubPosts = user.posts.map((post) => {
      // Parse platformData para extrair hook, cta, etc
      let extraData: any = {};
      try {
        if (post.platformData) {
          extraData = JSON.parse(post.platformData);
        }
      } catch (error) {
        console.error("Erro ao parsear platformData:", error);
      }

      const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];
      const hashtags = post.hashtags ? JSON.parse(post.hashtags) : [];

      return {
        id: post.id,
        title: extraData.hook || `Post ${post.type}`,
        caption: post.caption || "",
        type: post.type,
        status: post.status,
        image: mediaUrls[0] || post.thumbnailUrl || "",
        mediaUrls: mediaUrls,
        date: post.scheduledAt ? new Date(post.scheduledAt).toISOString().split("T")[0] : "",
        time: extraData.bestTimeToPost || "09:00",
        platform: "instagram",
        hashtags: hashtags,
        scheduledAt: post.scheduledAt,
        publishedAt: post.publishedAt,
        hook: extraData.hook,
        cta: extraData.cta,
        estimatedEngagement: extraData.estimatedEngagement,
        bestTimeToPost: extraData.bestTimeToPost,
        imagePrompt: extraData.imagePrompt,
        isAiGenerated: post.isAiGenerated,
        createdAt: post.createdAt,
        source: "content-hub",
      };
    });

    allPosts = [...contentHubPosts];

    // Posts do Onboarding
    if (user.onboarding?.initialPosts) {
      try {
        const initialPosts = JSON.parse(user.onboarding.initialPosts);
        const onboardingPosts = initialPosts.map((post: any, index: number) => ({
          id: `onboarding-${index + 1}`,
          title: post.hook || post.title || `Post ${index + 1}`,
          caption: post.caption || post.content || "",
          type: post.type || "SINGLE",
          status: "DRAFT",
          image: post.imageUrl || post.thumbnailUrl || "",
          mediaUrls: post.imageUrl ? [post.imageUrl] : [],
          date: "",
          time: post.bestTimeToPost || "09:00",
          platform: "instagram",
          hashtags: post.hashtags || [],
          scheduledAt: null,
          publishedAt: null,
          hook: post.hook,
          cta: post.cta,
          estimatedEngagement: post.estimatedEngagement,
          bestTimeToPost: post.bestTimeToPost,
          mediaType: post.mediaType,
          source: "onboarding",
        }));
        
        allPosts = [...allPosts, ...onboardingPosts];
      } catch (error) {
        console.error("Erro ao parsear posts do onboarding:", error);
      }
    }

    // Filtrar por mês se fornecido
    let filteredPosts = allPosts;
    if (month) {
      filteredPosts = allPosts.filter((post) => {
        if (!post.scheduledAt) return false;
        const postMonth = new Date(post.scheduledAt).getMonth() + 1;
        return postMonth === parseInt(month);
      });
    }

    return NextResponse.json({ 
      posts: filteredPosts,
      total: filteredPosts.length,
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts", posts: [] },
      { status: 500 }
    );
  }
}