// src/app/api/onboarding/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { AIOrchestrator } from "@/services/ai/multi-agent-system";
import { instagramAnalysisService } from "@/services/instagram/analysis.service";
import { imageGenerationService } from "@/services/media/image-generation.service";
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
          console.log(`✅ Análise Instagram concluída: Score ${instagramScore}/100`);
        }
      } catch (error) {
        console.error("Erro na análise do Instagram (continuando sem ela):", error);
        // Não falhar o onboarding se a análise do Instagram falhar
      }
    }

    // Iniciar Multi-Agent System
    console.log("🤖 Iniciando Multi-Agent System...");
    const orchestrator = new AIOrchestrator();
    
    // Adaptar dados para o formato que os agentes esperam
    const agentData = {
      niche: `${validatedData.business} - ${validatedData.businessDescription}`,
      objective: validatedData.objective,
      platforms: validatedData.platforms || ["instagram"],
      tone: validatedData.tone || "professional",
      autoPosting: validatedData.workMode,
      audience: validatedData.audience,
      audienceDetails: validatedData.audienceDetails,
    };

    const result = await orchestrator.processOnboarding(agentData);

    // Guardar na base de dados
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
        initialPosts: JSON.stringify(result.initialPosts),
        contentIdeas: JSON.stringify(result.contentIdeas),
        profileAnalysis: JSON.stringify(result.profileAnalysis),
        weeklyCalendar: JSON.stringify(result.weeklyCalendar),
        totalTokensUsed: result.metadata.totalTokens,
        generationCost: result.metadata.cost,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Estratégia criada com sucesso! 🎉",
      data: {
        ...result,
        instagramReport: instagramReport,
      },
      onboardingId: onboarding.id,
    });
  } catch (error) {
    console.error("Erro no onboarding:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar onboarding" },
      { status: 500 }
    );
  }
}

// GET - Buscar onboarding existente
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
      return NextResponse.json(
        { hasOnboarding: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasOnboarding: true,
      data: {
        ...user.onboarding,
        strategy: JSON.parse(user.onboarding.strategy),
        initialPosts: JSON.parse(user.onboarding.initialPosts),
        contentIdeas: JSON.parse(user.onboarding.contentIdeas),
        profileAnalysis: JSON.parse(user.onboarding.profileAnalysis),
        weeklyCalendar: JSON.parse(user.onboarding.weeklyCalendar),
        audienceDetails: JSON.parse(user.onboarding.audienceDetails),
        instagramReport: user.onboarding.instagramReport 
          ? JSON.parse(user.onboarding.instagramReport)
          : null,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar onboarding:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}