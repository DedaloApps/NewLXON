// src/app/api/posts/create-with-visual-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { visualPromptAgent } from "@/services/ai/visual-prompt-agent";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboarding: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    const { type, topic, customPrompt } = await req.json();

    if (!type || !topic) {
      return NextResponse.json(
        { error: "Tipo e tópico são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`🎨 Criando post ${type} sobre: ${topic}`);

    // 1️⃣ BUSCAR CONTEXTO DO NEGÓCIO DO ONBOARDING
    const businessContext = user.onboarding
      ? {
          business: user.onboarding.business || "negócio",
          businessDescription: user.onboarding.businessDescription || topic,
          audience: user.onboarding.audience || "público geral",
          objective: user.onboarding.objective || "engagement",
          tone: "professional",
        }
      : {
          business: "negócio geral",
          businessDescription: topic,
          audience: "público geral",
          objective: "engagement",
          tone: "professional",
        };

    // 2️⃣ GERAR PROMPT VISUAL PROFISSIONAL
    console.log("🎨 Visual Prompt Agent a trabalhar...");
    const visualStrategy = await visualPromptAgent.analyzeBusinessVisuals(
      businessContext
    );

    const imagePrompt = await visualPromptAgent.generatePromptForPost(
      visualStrategy,
      type as any,
      businessContext
    );

    console.log("✅ Prompt visual profissional gerado!");

    // 3️⃣ GERAR CAPTION COM CONTENT AGENT
    const captionPrompt = `Cria um post ${type} PREMIUM para Instagram sobre: ${topic}

${customPrompt ? `INSTRUÇÕES ADICIONAIS: ${customPrompt}` : ""}

CONTEXTO DO NEGÓCIO:
- Nicho: ${businessContext.business}
- Descrição: ${businessContext.businessDescription}
- Público: ${businessContext.audience}
- Objetivo: ${businessContext.objective}

REQUISITOS:
✅ Hook que para o scroll (max 10 palavras)
✅ Caption 125-150 palavras com storytelling
✅ Mínimo 3 emojis estratégicos
✅ CTA claro e acionável
✅ 10 hashtags (5 nicho + 3 médio + 2 alto)
✅ Tom conversacional PT-PT

FORMATO JSON:
{
  "hook": "Hook impactante EM PT-PT",
  "caption": "Caption completa 125-150 palavras. Texto final pronto sem marcadores.",
  "hashtags": ["tag1", "tag2", ...10 tags],
  "cta": "CTA específico PT-PT",
  "bestTimeToPost": "09:00"
}`;

    const captionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "Tu és um Content Agent especialista em criar captions virais para Instagram em PT-PT.",
        },
        { role: "user", content: captionPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const captionData = JSON.parse(
      captionResponse.choices[0].message.content || "{}"
    );

    console.log("✅ Caption gerada!");

    // 4️⃣ GERAR IMAGEM TEMPORÁRIA
    let temporaryImageUrl = "";
    try {
      console.log("🎨 Gerando imagem profissional...");

      const { imageGenerationService } = await import(
        "@/services/media/image-generation.service"
      );

      temporaryImageUrl = await imageGenerationService.generateImage({
        prompt: imagePrompt,
        style: type === "viral" ? "vibrant" : "realistic",
        aspectRatio: "1:1",
        quality: "hd",
      });

      console.log("✅ Imagem temporária gerada:", temporaryImageUrl);
    } catch (error: any) {
      console.error("❌ Erro ao gerar imagem:", error.message);
      console.warn("⚠️ Continuando sem imagem");
    }

    // 5️⃣ GUARDAR IMAGEM PERMANENTEMENTE NO SUPABASE
    let permanentImageUrl = temporaryImageUrl;

    if (temporaryImageUrl) {
      try {
        console.log("💾 A guardar imagem permanentemente no Supabase...");

        const { imageStorageService } = await import(
          "@/services/media/image-storage.service"
        );

        // Garantir que o bucket existe
        await imageStorageService.ensureBucketExists();

        // Guardar imagem permanentemente (ANTES de criar o post)
        const uploadResult = await imageStorageService.saveImagePermanently(
          temporaryImageUrl,
          user.id,
          `post-${type.toLowerCase()}-${Date.now()}`
        );

        permanentImageUrl = uploadResult.publicUrl;

        console.log("✅ Imagem permanente guardada:", permanentImageUrl);
      } catch (storageError: any) {
        console.error("⚠️ Falha ao guardar permanente:", storageError.message);
        console.log("ℹ️ Usando URL temporária (expira em 2h)");
        // permanentImageUrl já tem o valor de temporaryImageUrl
      }
    }

    // 6️⃣ CRIAR POST NA BASE DE DADOS (DEPOIS de ter a URL permanente)
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        type: type.toUpperCase(),
        caption: captionData.caption || "Caption gerada",
        hook: captionData.hook,
        hashtags: JSON.stringify(captionData.hashtags || []),
        cta: captionData.cta,
        imageUrl: permanentImageUrl, // ✅ Agora já está definido
        imagePrompt: imagePrompt,
        bestTimeToPost: captionData.bestTimeToPost || "09:00",
        status: "DRAFT",
        platform: "INSTAGRAM",
        isAiGenerated: true,
        mediaUrls: JSON.stringify([permanentImageUrl]), // ✅ Array
        thumbnailUrl: permanentImageUrl, // ✅ Thumbnail
        estimatedEngagement: "médio",
      },
    });

    console.log(`✅ Post criado: ${post.id}`);

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        type: post.type,
        hook: post.hook,
        caption: post.caption,
        hashtags: JSON.parse(post.hashtags || "[]"),
        cta: post.cta,
        imageUrl: permanentImageUrl,
        bestTimeToPost: post.bestTimeToPost,
        status: post.status,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar post:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar post" },
      { status: 500 }
    );
  }
}