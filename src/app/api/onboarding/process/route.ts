// src/app/api/onboarding/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { AIOrchestrator } from "@/services/ai/multi-agent-system";
import { instagramAnalysisService } from "@/services/instagram/analysis.service";
import { z } from "zod";

const onboardingSchema = z.object({
  business: z.string().min(1, "Tipo de negócio é obrigatório"),
  businessDescription: z.string().min(1, "Descrição do negócio é obrigatória"),
  audience: z.string().min(1, "Público-alvo é obrigatório"),
  audienceDetails: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
  }),
  objective: z.string().min(1, "Objetivo é obrigatório"),
  instagram: z.string().nullable(),
  workMode: z.string().min(1, "Modo de trabalho é obrigatório"),
  platforms: z.array(z.string()).optional(),
  tone: z.string().optional(),
});

// ✅ MÉTODO GET - Para buscar dados do onboarding
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já completou onboarding
    const onboarding = await prisma.onboardingResponse.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return NextResponse.json({
        hasOnboarding: false,
      });
    }

    // Retornar dados do onboarding
    return NextResponse.json({
      hasOnboarding: true,
      data: {
        business: onboarding.business,
        businessDescription: onboarding.businessDescription,
        audience: onboarding.audience,
        audienceDetails: JSON.parse(onboarding.audienceDetails),
        objective: onboarding.objective,
        workMode: onboarding.workMode,
        strategy: JSON.parse(onboarding.strategy),
        initialPosts: JSON.parse(onboarding.initialPosts),
        contentIdeas: JSON.parse(onboarding.contentIdeas),
        profileAnalysis: JSON.parse(onboarding.profileAnalysis),
        weeklyCalendar: JSON.parse(onboarding.weeklyCalendar),
        instagramReport: onboarding.instagramReport 
          ? JSON.parse(onboarding.instagramReport) 
          : null,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar dados do onboarding" },
      { status: 500 }
    );
  }
}

// ✅ MÉTODO POST - Para criar o onboarding
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já completou onboarding
    const existingOnboarding = await prisma.onboardingResponse.findUnique({
      where: { userId: user.id },
    });

    if (existingOnboarding) {
      return NextResponse.json(
        {
          error: "Onboarding já foi completado",
          canRedo: true,
        },
        { status: 400 }
      );
    }

    // Validar dados
    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    let instagramReport = null;
    let instagramScore = 0;

    // Se forneceu Instagram, fazer análise
    if (validatedData.instagram) {
      console.log(`📸 A analisar Instagram: ${validatedData.instagram}`);
      
      try {
        const instagramAnalysis = await instagramAnalysisService.generateFullReport(
          validatedData.instagram,
          {
            business: validatedData.business,
            businessDescription: validatedData.businessDescription,
            audience: validatedData.audience,
            objective: validatedData.objective,
          }
        );

        if (instagramAnalysis) {
          instagramReport = {
            username: instagramAnalysis.data.username,
            profileData: instagramAnalysis.data,
            analysis: instagramAnalysis.analysis,
            generatedAt: new Date(),
          };
          instagramScore = instagramAnalysis.analysis.overallScore;
        }
      } catch (error) {
        console.error("Erro ao analisar Instagram:", error);
      }
    }

    // ✅ GERAR ESTRATÉGIA COM MULTI-AGENT SYSTEM
    // O VisualAgent JÁ VAI GUARDAR AS IMAGENS PERMANENTEMENTE!
    console.log("🤖 A processar onboarding com Multi-Agent System...");
    const orchestrator = new AIOrchestrator();
    
    const result = await orchestrator.processOnboarding(
      {
        niche: validatedData.businessDescription,
        objective: validatedData.objective,
        platforms: validatedData.platforms || ["Instagram"],
        tone: validatedData.tone || "professional",
        autoPosting: validatedData.workMode,
        audience: validatedData.audience,
        audienceDetails: validatedData.audienceDetails,
      },
      user.id // ← PASSAR O userId PARA O ORCHESTRATOR!
    );

    console.log(`✅ Posts gerados com imagens permanentes em: content-images/${user.id}/`);

    // ✅ CRIAR POSTS NA BASE DE DADOS
    console.log("📝 A criar posts na base de dados...");
    
    const createdPosts = await Promise.all(
      result.initialPosts.map(async (post: any) => {
        try {
          return await prisma.post.create({
            data: {
              userId: user.id,
              type: 'SINGLE',
              status: 'DRAFT',
              caption: post.caption,
              hashtags: JSON.stringify(post.hashtags),
              isAiGenerated: true,
              aiPrompt: post.imagePrompt,
              mediaUrls: JSON.stringify([post.imageUrl]), // URL PERMANENTE!
              thumbnailUrl: post.imageUrl,
              scheduledAt: post.bestTimeToPost
                ? new Date(`${new Date().toISOString().split('T')[0]}T${post.bestTimeToPost}`)
                : null,
            },
          });
        } catch (error) {
          console.error('Erro ao criar post:', error);
          return null;
        }
      })
    );

    console.log(`✅ ${createdPosts.filter(p => p).length} posts criados na base de dados`);

    // ✅ GUARDAR NO ONBOARDING RESPONSE
    const onboarding = await prisma.onboardingResponse.create({
      data: {
        userId: user.id,
        business: validatedData.business,
        businessDescription: validatedData.businessDescription,
        audience: validatedData.audience,
        audienceDetails: JSON.stringify(validatedData.audienceDetails),
        objective: validatedData.objective,
        instagram: validatedData.instagram,
        workMode: validatedData.workMode,
        instagramReport: instagramReport ? JSON.stringify(instagramReport) : null,
        instagramScore: instagramScore,
        strategy: JSON.stringify(result.strategy),
        initialPosts: JSON.stringify(result.initialPosts), // JÁ TEM URLs PERMANENTES!
        contentIdeas: JSON.stringify(result.contentIdeas),
        profileAnalysis: JSON.stringify(result.profileAnalysis),
        weeklyCalendar: JSON.stringify(result.weeklyCalendar),
        totalTokensUsed: result.metadata.totalTokens,
        generationCost: result.metadata.cost,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        onboardingId: onboarding.id,
        postsCreated: createdPosts.filter(p => p).length,
        strategy: result.strategy,
        initialPosts: result.initialPosts, // COM URLs PERMANENTES!
        contentIdeas: result.contentIdeas,
        profileAnalysis: result.profileAnalysis,
        weeklyCalendar: result.weeklyCalendar,
        instagramReport: instagramReport,
        storageInfo: result.storageInfo, // Info sobre onde as imagens foram guardadas
        tokensUsed: result.metadata.totalTokens,
      },
    });
  } catch (error: any) {
    console.error("Erro no onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar onboarding" },
      { status: 500 }
    );
  }
}