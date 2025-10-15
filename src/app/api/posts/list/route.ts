// src/app/api/posts/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    // ✅ BUSCAR APENAS POSTS DA BD (não onboarding)
    const dbPosts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log(`📋 Posts da BD: ${dbPosts.length}`);

    // ✅ FORMATAR POSTS DA BD
    const formattedPosts = dbPosts.map((post) => {
      // Extrair URLs de mediaUrls (array JSON)
      let imageUrl = post.imageUrl || post.thumbnailUrl || "";
      
      if (!imageUrl && post.mediaUrls) {
        try {
          const mediaArray = JSON.parse(post.mediaUrls);
          imageUrl = mediaArray[0] || "";
        } catch (e) {
          console.error("Erro ao parsear mediaUrls:", e);
        }
      }

      const hashtags = post.hashtags ? JSON.parse(post.hashtags) : [];

      return {
        id: post.id,
        source: 'database',
        title: post.hook || post.caption?.substring(0, 50) || `Post ${post.type}`,
        caption: post.caption || "",
        type: post.type,
        status: post.status,
        image: imageUrl,
        imageUrl: imageUrl,
        mediaUrls: imageUrl ? [imageUrl] : [],
        date: post.scheduledAt
          ? new Date(post.scheduledAt).toLocaleDateString("pt-PT")
          : "",
        time: post.bestTimeToPost || "09:00",
        platform: post.platform?.toLowerCase() || "instagram",
        hashtags: hashtags,
        scheduledAt: post.scheduledAt?.toISOString(),
        estimatedEngagement: post.estimatedEngagement,
        hook: post.hook,
        cta: post.cta,
      };
    });

    console.log(`✅ Total de posts: ${formattedPosts.length}`);

    // Debug dos primeiros 3 posts
    formattedPosts.slice(0, 3).forEach((post, index) => {
      console.log(`🔍 Post ${index + 1}:`, {
        id: post.id,
        source: post.source,
        title: post.title,
        hasImage: !!post.image,
        imageUrl: post.image?.substring(0, 80) + "...",
      });
    });

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      stats: {
        total: formattedPosts.length,
        fromDatabase: formattedPosts.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao listar posts:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao listar posts" },
      { status: 500 }
    );
  }
}