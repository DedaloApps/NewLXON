// src/app/api/content/create-with-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { imageStorageService } from "@/services/media/image-storage.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // 2️⃣ PARSE FORMDATA
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const postType = formData.get("postType") as string;
    const topic = formData.get("topic") as string;
    const customInstructions = formData.get("customInstructions") as string;
    const niche = formData.get("niche") as string;
    const audience = formData.get("audience") as string;
    const tone = formData.get("tone") as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Imagem é obrigatória" },
        { status: 400 }
      );
    }

    console.log("📸 A processar upload de imagem...");
    console.log(`   Tipo: ${postType}`);
    console.log(`   Tópico: ${topic || "Não especificado"}`);

    // 3️⃣ CONVERTER IMAGEM PARA BASE64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const imageDataUrl = `data:${imageFile.type};base64,${base64Image}`;

    console.log("🖼️ Imagem convertida para base64");

    // 4️⃣ USAR VISION API PARA ANALISAR A IMAGEM
    console.log("👁️ A analisar imagem com GPT-4 Vision...");
    
    const visionPrompt = `Analisa esta imagem e descreve o que vês em 2-3 frases curtas e objetivas. 
Foca-te nos elementos principais, cores, ambiente e emoção transmitida.
Responde APENAS com a descrição, sem introdução.`;

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    });

    const imageDescription = visionResponse.choices[0].message.content || "Imagem profissional";
    console.log(`✅ Descrição da imagem: ${imageDescription.substring(0, 100)}...`);

    // 5️⃣ GERAR CAPTION COM IA (Content Agent)
    console.log("✍️ Content Agent a gerar caption...");

    const postTypeDescriptions: Record<string, string> = {
      educational: "EDUCATIVO - Ensina algo valioso ao público",
      viral: "VIRAL - Entretenimento e conteúdo relatable",
      sales: "VENDAS - Converte seguidores em clientes",
      engagement: "ENGAGEMENT - Gera conversa e interação",
      behind_scenes: "BASTIDORES - Mostra o processo e humaniza a marca",
    };

    const captionPrompt = `Cria um post PREMIUM (nota 9-10) para Instagram baseado nesta imagem:

DESCRIÇÃO DA IMAGEM: ${imageDescription}

CONTEXTO:
- Tipo de post: ${postTypeDescriptions[postType] || postType}
- Tópico: ${topic || "Post sobre o negócio"}
- Nicho: ${niche || "Geral"}
- Público: ${audience || "Geral"}
- Tom: ${tone || "Profissional"}
${customInstructions ? `- Instruções especiais: ${customInstructions}` : ""}

REQUISITOS OBRIGATÓRIOS:
✅ Hook impactante (max 10 palavras) EM PT-PT
✅ Caption 125-150 palavras com storytelling que se conecta com a imagem
✅ Mínimo 3 emojis estratégicos
✅ CTA claro e específico
✅ 10 hashtags (5 nicho + 3 médio + 2 alto)
✅ Tom conversacional PT-PT (usa "tu", "teu", "contigo")
✅ Zero clichés
✅ A caption deve fazer sentido com o que está na imagem

ESTRUTURA DA CAPTION:
🎯 HOOK (1 linha que prende atenção)

[Linha em branco]

Storytelling de 80-100 palavras:
- Conecta-te à imagem e ao que ela transmite
- Liga à dor/desejo do público
- Frases curtas e impactantes
- História pessoal ou caso real
- 2-3 emojis naturais

[Linha em branco]

Value proposition (20-30 palavras)

[Linha em branco]

💬 CTA específico

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
    console.log(`   Quality score: ${postContent.qualityScore}`);

    // 6️⃣ GUARDAR IMAGEM PERMANENTEMENTE NO SUPABASE
    console.log("📥 A guardar imagem permanentemente no Supabase...");
    
    const saved = await imageStorageService.saveImagePermanently(
      imageDataUrl,
      user.id,
      `custom-${Date.now()}`
    );

    const permanentImageUrl = saved.publicUrl;
    console.log(`✅ Imagem guardada: ${permanentImageUrl}`);

    // 7️⃣ CRIAR POST NA BASE DE DADOS
    console.log("💾 A guardar post na base de dados...");

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        type: "SINGLE",
        status: "DRAFT",
        platform: "INSTAGRAM",
        
        caption: postContent.caption,
        hashtags: JSON.stringify(postContent.hashtags || []),
        hook: postContent.hook,
        cta: postContent.cta,
        imagePrompt: imageDescription, // Guardamos a descrição da imagem
        estimatedEngagement: postContent.estimatedEngagement || "médio",
        bestTimeToPost: postContent.bestTimeToPost || "09:00",
        
        mediaUrls: JSON.stringify([permanentImageUrl]),
        
        isAiGenerated: true,
        aiPrompt: topic || "Post personalizado com imagem do utilizador",
      },
    });

    console.log(`✅ Post criado: ${post.id}`);

    // 8️⃣ REGISTAR GERAÇÃO DE IA (para analytics)
    await prisma.aIGeneration.create({
      data: {
        userId: user.id,
        type: "IMAGE",
        prompt: `Custom post: ${topic || "Sem tópico"}`,
        result: JSON.stringify({
          postId: post.id,
          caption: postContent.caption,
          hook: postContent.hook,
          qualityScore: postContent.qualityScore,
          imageDescription: imageDescription,
        }),
        model: "gpt-4-turbo-preview + gpt-4-vision",
        cost: 0.08, // Estimativa (Vision API custa mais)
        tokensUsed: completion.usage?.total_tokens || 0,
      },
    });

    // 9️⃣ RETORNAR SUCESSO
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        type: post.type,
        hook: postContent.hook,
        caption: postContent.caption,
        hashtags: postContent.hashtags,
        cta: postContent.cta,
        imageUrl: permanentImageUrl,
        estimatedEngagement: postContent.estimatedEngagement,
        bestTimeToPost: postContent.bestTimeToPost,
        qualityScore: postContent.qualityScore,
        targetAudience: postContent.targetAudience,
        createdAt: post.createdAt,
      },
      message: "Post criado com sucesso! 🎉",
    });

  } catch (error: any) {
    console.error("❌ Erro ao criar post:", error);
    
    return NextResponse.json(
      {
        error: "Erro ao criar post",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Configuração para aceitar ficheiros grandes
export const config = {
  api: {
    bodyParser: false,
  },
};