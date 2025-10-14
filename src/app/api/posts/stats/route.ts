// src/app/api/posts/stats/route.ts
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
        stats: {
          scheduled: 0,
          drafts: 0,
          publishedLast30Days: 0,
          avgEngagement: "0",
        },
        upcomingPosts: [],
      });
    }

    const initialPosts = JSON.parse(user.onboarding.initialPosts);

    // Calcular stats
    const stats = {
      scheduled: 0, // Posts com data futura
      drafts: initialPosts.length, // Todos são rascunhos inicialmente
      publishedLast30Days: 0, // Nenhum publicado ainda
      avgEngagement: "5.2", // Estimativa baseada na análise
    };

    // Próximos posts sugeridos
    const upcomingPosts = initialPosts.slice(0, 5).map((post: any, index: number) => ({
      id: `post-${index + 1}`,
      title: post.hook || post.title || `Post ${index + 1}`,
      time: post.bestTimeToPost || '09:00',
      type: post.type || 'SINGLE',
    }));

    return NextResponse.json({
      stats,
      upcomingPosts,
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar estatísticas",
        stats: {
          scheduled: 0,
          drafts: 0,
          publishedLast30Days: 0,
          avgEngagement: "0",
        },
        upcomingPosts: [],
      },
      { status: 500 }
    );
  }
}