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

  platforms: z.array(z.string()).optional(),
  tone: z.string().optional(),
});

// ✅ MÉTODO GET - Para buscar dados do onboarding OU SSE para progresso em tempo real
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
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

    // 🆕 Verificar se é pedido SSE (tem query param 'answers')
    const url = new URL(req.url);
    const answersParam = url.searchParams.get("answers");

    if (answersParam) {
      // 🆕 SSE MODE - Progresso em tempo real
      return handleSSEProgress(user.id, answersParam);
    }

    // Modo normal - Buscar dados existentes
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

// 🆕 Função para SSE - Progresso em tempo real
async function handleSSEProgress(userId: string, answersParam: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Função para enviar eventos
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        // Parse e validação
        const validatedData = onboardingSchema.parse(
          JSON.parse(decodeURIComponent(answersParam))
        );

        // Callback para progresso
        const onProgress = (event: any) => {
          sendEvent(event);
        };

        // 1. Business Analysis
        sendEvent({
          type: "stage",
          stage: "business_analysis",
          title: "Analisando o negócio",
          subtitle: "A processar informações...",
          progress: 5,
        });

        let instagramReport = null;
        let instagramScore = 0;

        // 2. Instagram Analysis (se houver)
        if (validatedData.instagram) {
          sendEvent({
            type: "stage",
            stage: "instagram",
            title: "Analisando Instagram",
            subtitle: `@${validatedData.instagram.replace("@", "")}`,
            progress: 15,
          });

          try {
            const instagramAnalysis =
              await instagramAnalysisService.generateFullReport(
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

        // 3. Strategy Creation
        sendEvent({
          type: "stage",
          stage: "strategy",
          title: "Criando estratégia de conteúdo",
          subtitle: "Pilares, formatos e calendário...",
          progress: 20,
        });

        // Processar com Multi-Agent System
        const orchestrator = new AIOrchestrator();

        const result = await orchestrator.processOnboarding(
          {
            niche: validatedData.businessDescription,
            objective: validatedData.objective,
            platforms: validatedData.platforms || ["Instagram"],
            tone: validatedData.tone || "professional",
            audience: validatedData.audience,
            audienceDetails: validatedData.audienceDetails,
          },
          userId,
          onProgress
        );

        // 4. Saving Posts
        sendEvent({
          type: "stage",
          stage: "saving_posts",
          title: "A guardar posts na base de dados",
          subtitle: "Quase pronto...",
          progress: 90,
        });

        const createdPosts = await Promise.all(
          result.initialPosts.map(async (post: any) => {
            try {
              return await prisma.post.create({
                data: {
                  userId: userId,
                  type: "SINGLE",
                  status: "DRAFT",
                  caption: post.caption,
                  hashtags: JSON.stringify(post.hashtags),
                  isAiGenerated: true,
                  aiPrompt: post.imagePrompt,
                  mediaUrls: JSON.stringify([
                    post.videoUrl || post.imageUrl || "",
                  ]),
                  thumbnailUrl: post.thumbnailUrl || post.imageUrl,
                  scheduledAt: post.bestTimeToPost
                    ? new Date(
                        `${new Date().toISOString().split("T")[0]}T${
                          post.bestTimeToPost
                        }`
                      )
                    : null,
                },
              });
            } catch (error) {
              console.error("Erro ao criar post:", error);
              return null;
            }
          })
        );

        // 5. Saving Onboarding
        sendEvent({
          type: "stage",
          stage: "finalizing",
          title: "Finalizando estratégia",
          subtitle: "Tudo pronto!",
          progress: 95,
        });

        // 🆕 OPÇÃO 3: Verificar se existe antes de criar
        const existingOnboarding = await prisma.onboardingResponse.findUnique({
          where: { userId: userId },
        });

        let onboarding;

        if (existingOnboarding) {
          // Atualizar existente
          onboarding = await prisma.onboardingResponse.update({
            where: { userId: userId },
            data: {
              business: validatedData.business,
              businessDescription: validatedData.businessDescription,
              audience: validatedData.audience,
              audienceDetails: JSON.stringify(validatedData.audienceDetails),
              objective: validatedData.objective,
              instagram: validatedData.instagram,
              instagramReport: instagramReport
                ? JSON.stringify(instagramReport)
                : null,
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
        } else {
          // Criar novo
          onboarding = await prisma.onboardingResponse.create({
            data: {
              userId: userId,
              business: validatedData.business,
              businessDescription: validatedData.businessDescription,
              audience: validatedData.audience,
              audienceDetails: JSON.stringify(validatedData.audienceDetails),
              objective: validatedData.objective,
              instagram: validatedData.instagram,
              instagramReport: instagramReport
                ? JSON.stringify(instagramReport)
                : null,
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
        }

        // Complete!
        sendEvent({
          type: "complete",
          progress: 100,
          data: {
            onboardingId: onboarding.id,
            postsCreated: createdPosts.filter((p) => p).length,
          },
        });

        controller.close();
      } catch (error: any) {
        console.error("Erro no SSE:", error);
        sendEvent({
          type: "error",
          message: error.message || "Erro ao processar",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Nginx fix
    },
  });
}

// ✅ MÉTODO POST - Para criar o onboarding (fallback se SSE não funcionar)
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
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

    // Validar dados
    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    let instagramReport = null;
    let instagramScore = 0;

    // Se forneceu Instagram, fazer análise
    if (validatedData.instagram) {
      console.log(`📸 A analisar Instagram: ${validatedData.instagram}`);

      try {
        const instagramAnalysis =
          await instagramAnalysisService.generateFullReport(
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
    console.log("🤖 A processar onboarding com Multi-Agent System...");
    const orchestrator = new AIOrchestrator();

    const result = await orchestrator.processOnboarding(
      {
        niche: validatedData.businessDescription,
        objective: validatedData.objective,
        platforms: validatedData.platforms || ["Instagram"],
        tone: validatedData.tone || "professional",
        audience: validatedData.audience,
        audienceDetails: validatedData.audienceDetails,
      },
      user.id
    );

    console.log(
      `✅ Posts gerados com imagens permanentes em: content-images/${user.id}/`
    );

    // ✅ CRIAR POSTS NA BASE DE DADOS
    console.log("📝 A criar posts na base de dados...");

    const createdPosts = await Promise.all(
      result.initialPosts.map(async (post: any) => {
        try {
          return await prisma.post.create({
            data: {
              userId: user.id,
              type: "SINGLE",
              status: "DRAFT",
              caption: post.caption,
              hashtags: JSON.stringify(post.hashtags),
              isAiGenerated: true,
              aiPrompt: post.imagePrompt,
              mediaUrls: JSON.stringify([post.imageUrl]),
              thumbnailUrl: post.imageUrl,
              scheduledAt: post.bestTimeToPost
                ? new Date(
                    `${new Date().toISOString().split("T")[0]}T${
                      post.bestTimeToPost
                    }`
                  )
                : null,
            },
          });
        } catch (error) {
          console.error("Erro ao criar post:", error);
          return null;
        }
      })
    );

    console.log(
      `✅ ${
        createdPosts.filter((p) => p).length
      } posts criados na base de dados`
    );

    // 🆕 OPÇÃO 3: Verificar se existe antes de criar
    const existingOnboarding = await prisma.onboardingResponse.findUnique({
      where: { userId: user.id },
    });

    let onboarding;

    if (existingOnboarding) {
      // Atualizar existente
      onboarding = await prisma.onboardingResponse.update({
        where: { userId: user.id },
        data: {
          business: validatedData.business,
          businessDescription: validatedData.businessDescription,
          audience: validatedData.audience,
          audienceDetails: JSON.stringify(validatedData.audienceDetails),
          objective: validatedData.objective,
          instagram: validatedData.instagram,
          instagramReport: instagramReport
            ? JSON.stringify(instagramReport)
            : null,
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
      console.log("✅ Onboarding existente atualizado");
    } else {
      // Criar novo
      onboarding = await prisma.onboardingResponse.create({
        data: {
          userId: user.id,
          business: validatedData.business,
          businessDescription: validatedData.businessDescription,
          audience: validatedData.audience,
          audienceDetails: JSON.stringify(validatedData.audienceDetails),
          objective: validatedData.objective,
          instagram: validatedData.instagram,
          instagramReport: instagramReport
            ? JSON.stringify(instagramReport)
            : null,
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
      console.log("✅ Novo onboarding criado");
    }

    return NextResponse.json({
      success: true,
      data: {
        onboardingId: onboarding.id,
        postsCreated: createdPosts.filter((p) => p).length,
        strategy: result.strategy,
        initialPosts: result.initialPosts,
        contentIdeas: result.contentIdeas,
        profileAnalysis: result.profileAnalysis,
        weeklyCalendar: result.weeklyCalendar,
        instagramReport: instagramReport,
        storageInfo: result.storageInfo,
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