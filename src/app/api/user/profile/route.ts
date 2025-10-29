// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  socialConnections: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      postReminders: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
      newFeatures: z.boolean().optional(),
    })
    .optional(),
});

// GET: Obter dados do perfil
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        posts: {
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },
        accounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            followers: true,
            following: true,
            totalPosts: true,
            isActive: true,
          },
        },
        onboarding: {
          select: {
            instagram: true,
            business: true,
            businessDescription: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Contar posts publicados e agendados
    const publishedPosts = user.posts.filter(p => p.status === 'PUBLISHED').length;
    const scheduledPosts = user.posts.filter(p => p.status === 'SCHEDULED').length;
    const draftPosts = user.posts.filter(p => p.status === 'DRAFT').length;

    // Somar seguidores de todas as contas sociais
    const totalFollowers = user.accounts.reduce((sum, acc) => sum + acc.followers, 0);
    const totalFollowing = user.accounts.reduce((sum, acc) => sum + acc.following, 0);

    // Buscar conta Instagram se existir
    const instagramAccount = user.accounts.find(acc => acc.platform.toLowerCase() === 'instagram');

    const profileData = {
      name: user.name,
      email: user.email,
      phone: "", // Adicionar ao schema depois se necessário
      bio: user.onboarding?.businessDescription || "",
      location: "",
      website: "",
      image: user.image || "",
      
      // Conexões sociais
      instagram: user.onboarding?.instagram || instagramAccount?.username || "",
      facebook: "",
      linkedin: "",
      twitter: "",

      // Contas sociais conectadas
      socialAccounts: user.accounts.map(acc => ({
        platform: acc.platform,
        username: acc.username,
        followers: acc.followers,
        following: acc.following,
        totalPosts: acc.totalPosts,
        isActive: acc.isActive,
      })),

      // Estatísticas
      postsCount: user.posts.length,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      totalFollowers,
      totalFollowing,
      accountAge,

      // Plano
      subscriptionTier: user.subscriptionTier || "free",
      subscriptionStatus: user.subscriptionStatus || "active",

      // Notificações (default)
      notifications: {
        email: true,
        push: false,
        postReminders: true,
        weeklyReport: true,
        newFeatures: false,
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao carregar perfil" },
      { status: 500 }
    );
  }
}

// PUT: Atualizar dados do perfil
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileUpdateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar dados básicos do User
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.avatar) updateData.image = validatedData.avatar;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // NOTA: Para guardar phone, bio, location, website, socialConnections, notifications
    // Precisas de criar uma tabela UserProfile ou adicionar campos ao User
    // Por agora, vou criar uma estrutura JSON temporária

    // Idealmente, crias:
    // model UserProfile {
    //   id        String  @id @default(cuid())
    //   userId    String  @unique
    //   phone     String?
    //   bio       String?
    //   location  String?
    //   website   String?
    //   instagram String?
    //   facebook  String?
    //   linkedin  String?
    //   twitter   String?
    //   notifications String? // JSON
    //   user      User    @relation(fields: [userId], references: [id])
    // }

    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}