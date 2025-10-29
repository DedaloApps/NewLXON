// src/app/api/content/generate-from-idea/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { imageGenerationService } from "@/services/media/image-generation.service";
import { imageStorageService } from "@/services/media/image-storage.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateFromIdeaBody {
  idea: {
    title: string;
    type: string; // carousel, reel, post
    value: string;
    difficulty: string;
    targetPillar?: string;
  };
  businessContext: {
    niche: string;
    audience?: string;
    tone: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ AUTENTICAÇÃO
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
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

    // 2️⃣ PARSE DO BODY
    const body: GenerateFromIdeaBody = await req.json();
    const { idea, businessContext } = body;

    console.log("🚀 Gerando post a partir da ideia:", idea.title);
    console.log("📋 Tipo:", idea.type);
    console.log("🎯 Negócio:", businessContext.niche);

    // 3️⃣ DETERMINAR TIPO DE POST E MEDIA
    const postType = determinePostType(idea.type);
    const mediaType = idea.type === "reel" ? "reel" : "image";

    console.log(`📸 Media type: ${mediaType}`);
    console.log(`📝 Post type: ${postType}`);

    // 4️⃣ GERAR CAPTION COM IA (Content Agent)
    console.log("✍️ Content Agent a gerar caption...");
    
    const captionPrompt = `Cria um post PREMIUM (nota 9-10) para Instagram baseado nesta ideia:

IDEIA: ${idea.title}
VALOR: ${idea.value}
TIPO: ${idea.type}
NICHO: ${businessContext.niche}
PÚBLICO: ${businessContext.audience || "Geral"}
TOM: ${businessContext.tone}

REQUISITOS OBRIGATÓRIOS:
✅ Hook impactante (max 10 palavras) EM PT-PT
✅ Caption 125-150 palavras com storytelling
✅ Mínimo 3 emojis estratégicos
✅ CTA claro e específico
✅ 10 hashtags (5 nicho + 3 médio + 2 alto)
✅ Tom conversacional PT-PT (usa "tu", "teu", "contigo")
✅ Zero clichés

ESTRUTURA DA CAPTION:
🎯 HOOK (1 linha)

[Linha em branco]

Storytelling de 80-100 palavras:
- Liga à dor/desejo do público
- Frases curtas e impactantes
- História pessoal ou caso real
- 2-3 emojis naturais

[Linha em branco]

Value proposition (20-30 palavras)

[Linha em branco]

💬 CTA específico

${mediaType === "reel" ? `

SCRIPT DO VÍDEO (30-45 segundos):
[0-5s] INTRO - Hook visual + verbal
[5-15s] PROBLEMA - Dor que o público sente
[15-30s] SOLUÇÃO - Como resolver
[30-45s] CTA - Ação específica clara

Texto completo do que dizer em PT-PT conversacional.
` : ""}

FORMATO JSON:
{
  "hook": "Hook impactante PT-PT",
  "caption": "Caption COMPLETA 125-150 palavras. Texto final pronto, sem marcadores tipo [Storytelling], [Linha em branco]. Apenas texto real com emojis e quebras de linha.",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "cta": "CTA específico PT-PT",
  "estimatedEngagement": "alto",
  "bestTimeToPost": "09:00",
  "wordCount": 135,
  "emojiCount": 4,
  "qualityScore": 9.5,
  "imagePrompt": "Prompt profissional para FLUX Pro Ultra gerar fotografia ultra-realista. Descreve cena específica, iluminação, composição, estilo fotográfico. Ex: 'Professional product photography of [produto] on marble surface, natural window lighting from left, Canon EOS R5, f/2.8, warm color grading, minimalist composition, real photography, subtle shadows, organic imperfections'",
  ${mediaType === "reel" ? '"videoScript": "Script detalhado 30-45 segundos PT-PT com timing de cada parte",' : ""}
  "targetAudience": "Quem é o público-alvo específico"
}

CRÍTICO: Caption deve ser texto FINAL pronto a copiar/colar, sem [instruções] ou marcadores.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Tu és o Content Agent PREMIUM, especialista em copywriting viral para Instagram.
Crias captions que param o scroll, storytelling emocional, e CTAs que convertem.
SEMPRE em PORTUGUÊS DE PORTUGAL (PT-PT): usa "tu", "teu", "contigo", nunca "você".`,
        },
        { role: "user", content: captionPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const postContent = JSON.parse(completion.choices[0].message.content || "{}");

    console.log("✅ Caption gerada:");
    console.log(`   Hook: ${postContent.hook?.substring(0, 50)}...`);
    console.log(`   Caption length: ${postContent.caption?.length} chars`);
    console.log(`   Word count: ${postContent.wordCount}`);
    console.log(`   Quality score: ${postContent.qualityScore}`);

    // 5️⃣ GERAR MEDIA (IMAGEM OU VÍDEO)
    let imageUrl: string | undefined;
    let videoUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    let duration: number | undefined;

    if (mediaType === "reel") {
      console.log("🎬 Gerando vídeo com Luma... (placeholder por agora)");
      
      // TODO: Integrar Luma quando disponível
      videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
      thumbnailUrl = "https://via.placeholder.com/1080x1920";
      duration = 30;
      
      console.log("⚠️ Usando vídeo placeholder (Luma ainda não integrado)");
    } else {
      console.log("🖼️ Gerando imagem com FLUX Pro Ultra...");
      
      try {
        // Gerar imagem temporária
        const temporaryUrl = await imageGenerationService.generateImage({
          prompt: postContent.imagePrompt,
          style: "realistic",
          aspectRatio: "1:1",
        });

        console.log("📥 Imagem temporária gerada, a guardar permanentemente...");

        // Guardar permanentemente no Supabase
        const saved = await imageStorageService.saveImagePermanently(
          temporaryUrl,
          user.id,
          `idea-${Date.now()}`
        );

        imageUrl = saved.publicUrl;
        console.log(`✅ Imagem guardada: ${imageUrl}`);
      } catch (error) {
        console.error("❌ Erro ao gerar imagem:", error);
        imageUrl = "https://via.placeholder.com/1080x1080";
      }
    }

    // 6️⃣ CRIAR POST NA BASE DE DADOS
    console.log("💾 A guardar post na base de dados...");

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        type: postType,
        status: "DRAFT",
        platform: "INSTAGRAM",
        
        caption: postContent.caption,
        hashtags: JSON.stringify(postContent.hashtags || []),
        hook: postContent.hook,
        cta: postContent.cta,
        imagePrompt: postContent.imagePrompt,
        estimatedEngagement: postContent.estimatedEngagement || "médio",
        bestTimeToPost: postContent.bestTimeToPost || "09:00",
        
        mediaUrls: mediaType === "reel" && videoUrl 
          ? JSON.stringify([videoUrl]) 
          : imageUrl 
          ? JSON.stringify([imageUrl])
          : undefined,
        thumbnailUrl: thumbnailUrl,
        
        isAiGenerated: true,
        aiPrompt: idea.title,
      },
    });

    console.log(`✅ Post criado: ${post.id}`);

    // 7️⃣ REGISTAR GERAÇÃO DE IA (para analytics)
    await prisma.aIGeneration.create({
      data: {
        userId: user.id,
        type: mediaType === "reel" ? "VIDEO" : "IMAGE",
        prompt: idea.title,
        result: JSON.stringify({
          postId: post.id,
          caption: postContent.caption,
          hook: postContent.hook,
          qualityScore: postContent.qualityScore,
        }),
        model: "gpt-4-turbo-preview",
        cost: 0.05, // Estimativa
        tokensUsed: completion.usage?.total_tokens || 0,
      },
    });

    // 8️⃣ RETORNAR SUCESSO
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        type: post.type,
        mediaType: mediaType,
        hook: postContent.hook,
        caption: postContent.caption,
        hashtags: postContent.hashtags,
        cta: postContent.cta,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        duration: duration,
        estimatedEngagement: postContent.estimatedEngagement,
        bestTimeToPost: postContent.bestTimeToPost,
        qualityScore: postContent.qualityScore,
        targetAudience: postContent.targetAudience,
        createdAt: post.createdAt,
      },
      message: "Post gerado com sucesso! 🎉",
    });

  } catch (error: any) {
    console.error("❌ Erro ao gerar post:", error);
    
    return NextResponse.json(
      {
        error: "Erro ao gerar post",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper: Determinar tipo de post baseado no tipo de ideia
function determinePostType(ideaType: string): string {
  const typeMap: Record<string, string> = {
    carousel: "CAROUSEL",
    reel: "REEL",
    post: "SINGLE",
    video: "VIDEO",
    story: "STORY",
  };

  return typeMap[ideaType.toLowerCase()] || "SINGLE";
}