// src/app/api/posts/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { imageGenerationService } from "@/services/media/image-generation.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { type, topic, customPrompt } = await req.json();

    if (!type || !topic) {
      return NextResponse.json(
        { error: "Tipo e tópico são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar dados do onboarding do utilizador
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { onboarding: true },
    });

    if (!user?.onboarding) {
      return NextResponse.json(
        { error: "Onboarding não encontrado. Completa o onboarding primeiro." },
        { status: 400 }
      );
    }

    const onboarding = user.onboarding;

    console.log(`🤖 A criar post ${type} sobre: ${topic}`);

    // Criar prompt para a IA baseado no tipo de post
    const systemPrompt = `Tu és um expert em criar conteúdo viral para redes sociais.
Especializas-te em escrever captions que geram engagement, usando storytelling e psicologia.
Nunca crias conteúdo genérico - tudo é personalizado e estratégico.`;

    const typeInstructions = {
      educational: "Cria um post EDUCATIVO que ensina algo extremamente valioso. Usa o formato de tutorial ou dica prática.",
      viral: "Cria um post VIRAL que é relatable, entretenimento puro ou provoca emoção. Deve ser altamente partilhável.",
      sales: "Cria um post de VENDAS que converte. Foca nos benefícios, prova social e urgência. CTA forte.",
      engagement: "Cria um post de ENGAGEMENT que gera conversa. Faz perguntas, pede opiniões, cria debate saudável.",
    };

    const userPrompt = `Cria 1 post COMPLETO sobre: ${topic}

Contexto do negócio:
- Nicho: ${onboarding.business} - ${onboarding.businessDescription}
- Público-alvo: ${onboarding.audience}
- Objetivo: ${onboarding.objective}

Tipo de post: ${type}
${typeInstructions[type as keyof typeof typeInstructions]}

${customPrompt ? `\nInstruções adicionais: ${customPrompt}` : ''}

Retorna JSON EXATAMENTE neste formato:
{
  "type": "${type}",
  "hook": "Frase de abertura extremamente impactante (máximo 10 palavras)",
  "caption": "Caption completa com storytelling, 3-5 parágrafos, quebras de linha para leitura fácil",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "cta": "Call to action claro e direto (1 frase)",
  "imagePrompt": "Descrição MUITO detalhada para gerar imagem profissional com IA. Descreve cores, composição, elementos, estilo, mood. Mínimo 20 palavras.",
  "estimatedEngagement": "alto/médio/baixo",
  "bestTimeToPost": "HH:MM no formato 24h"
}

IMPORTANTE:
- A caption deve ser EM PORTUGUÊS
- Usa emojis estrategicamente
- Hook deve parar o scroll
- Caption com storytelling real
- CTA específico e acionável
- imagePrompt em inglês, super detalhado
- Hashtags relevantes para ${onboarding.audience}`;

    console.log("📝 A gerar conteúdo com IA...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const post = JSON.parse(completion.choices[0].message.content || "{}");

    console.log("🎨 A gerar imagem com IA...");

    // Gerar imagem
    const imageUrl = await imageGenerationService.generateImage({
      prompt: post.imagePrompt,
      style: "professional",
      aspectRatio: "1:1",
      quality: "hd",
    });

    console.log("💾 A guardar post na base de dados...");

    // Guardar post na base de dados
    const savedPost = await prisma.post.create({
      data: {
        userId: user.id,
        type: post.type,
        caption: post.caption,
        hashtags: JSON.stringify(post.hashtags),
        mediaUrls: JSON.stringify([imageUrl]),
        thumbnailUrl: imageUrl,
        status: "DRAFT",
        isAiGenerated: true,
        aiPrompt: topic,
        // Guardar dados extras no platformData como JSON
        platformData: JSON.stringify({
          hook: post.hook,
          cta: post.cta,
          imagePrompt: post.imagePrompt,
          estimatedEngagement: post.estimatedEngagement,
          bestTimeToPost: post.bestTimeToPost,
        }),
      },
    });

    console.log("✅ Post criado com sucesso!");

    // Retornar post com todos os campos parseados
    return NextResponse.json({
      success: true,
      post: {
        id: savedPost.id,
        type: savedPost.type,
        hook: post.hook,
        caption: savedPost.caption,
        hashtags: JSON.parse(savedPost.hashtags || "[]"),
        cta: post.cta,
        imageUrl: imageUrl,
        imagePrompt: post.imagePrompt,
        estimatedEngagement: post.estimatedEngagement,
        bestTimeToPost: post.bestTimeToPost,
        status: savedPost.status,
        createdAt: savedPost.createdAt,
      },
    });

    console.log("✅ Post criado com sucesso!");

    return NextResponse.json({
      success: true,
      post: savedPost,
    });
  } catch (error: any) {
    console.error("Erro ao criar post:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar post" },
      { status: 500 }
    );
  }
}