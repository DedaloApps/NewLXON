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
      },
    });

    if (!user?.onboarding) {
      return NextResponse.json({
        posts: [],
        message: "Nenhum post encontrado. Complete o onboarding primeiro.",
      });
    }

    // Parse dos posts do onboarding
    const initialPosts = JSON.parse(user.onboarding.initialPosts);

    // Transformar posts para o formato esperado pelo Content Hub
    const posts = initialPosts.map((post: any, index: number) => ({
      id: `post-${index + 1}`,
      title: post.hook || post.title || `Post ${index + 1}`,
      caption: post.caption || post.content || '',
      type: post.type || 'SINGLE',
      status: 'DRAFT', // Todos os posts iniciais são rascunhos
      image: post.imageUrl || post.thumbnailUrl || '',
      mediaUrls: post.imageUrl ? [post.imageUrl] : [],
      date: '', // Será preenchido quando o user agendar
      time: post.bestTimeToPost || '09:00',
      platform: 'instagram',
      hashtags: post.hashtags || [],
      scheduledAt: null,
      // Dados adicionais do post original
      hook: post.hook,
      cta: post.cta,
      estimatedEngagement: post.estimatedEngagement,
      bestTimeToPost: post.bestTimeToPost,
      mediaType: post.mediaType,
    }));

    return NextResponse.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts", posts: [] },
      { status: 500 }
    );
  }
}

// GET com filtro por mês (para calendário)
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
      },
    });

    if (!user?.onboarding) {
      return NextResponse.json({ posts: [] });
    }

    const initialPosts = JSON.parse(user.onboarding.initialPosts);

    const posts = initialPosts.map((post: any, index: number) => ({
      id: `post-${index + 1}`,
      title: post.hook || post.title || `Post ${index + 1}`,
      caption: post.caption || post.content || '',
      type: post.type || 'SINGLE',
      status: 'DRAFT',
      image: post.imageUrl || post.thumbnailUrl || '',
      mediaUrls: post.imageUrl ? [post.imageUrl] : [],
      date: '',
      time: post.bestTimeToPost || '09:00',
      platform: 'instagram',
      hashtags: post.hashtags || [],
      scheduledAt: null,
      hook: post.hook,
      cta: post.cta,
      estimatedEngagement: post.estimatedEngagement,
      bestTimeToPost: post.bestTimeToPost,
      mediaType: post.mediaType,
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts", posts: [] },
      { status: 500 }
    );
  }
}