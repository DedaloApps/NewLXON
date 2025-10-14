// src/app/api/posts/ai-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { caption, title, hashtags, platform } = await req.json();

    // Usar IA para analisar e dar sugestões
    const prompt = `Analisa este post de Instagram e dá sugestões de melhoria:

TÍTULO: ${title}
CAPTION: ${caption}
HASHTAGS: ${hashtags?.join(', ') || 'Nenhuma'}
PLATAFORMA: ${platform || 'Instagram'}

Retorna em JSON:
{
  "score": 8.5,
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "bestTime": "18:00-20:00",
  "engagementBoost": 45,
  "suggestedHashtags": ["tag1", "tag2", "tag3"],
  "improvedCaption": "Versão melhorada da caption com melhor hook e CTA",
  "captionLength": "ideal/muito_longa/muito_curta",
  "hasEmojis": true,
  "hasCTA": true,
  "readability": 8.5
}

Critérios de avaliação:
- Hook inicial forte
- Storytelling envolvente
- Call-to-action claro
- Emojis apropriados
- Tamanho da caption (ideal: 125-150 palavras)
- Hashtags relevantes e não saturadas
- Tom de voz consistente

Sê específico e prático nas sugestões!`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'És um especialista em Instagram marketing com 10+ anos de experiência. Analisas posts e dás sugestões precisas e acionáveis para aumentar engagement.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const suggestions = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar sugestões' },
      { status: 500 }
    );
  }
}

// src/app/api/posts/[id]/route.ts - ADICIONAR PATCH para editar
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { caption } = await req.json();

    // Por agora, apenas retorna sucesso (posts estão no onboarding)
    // Em produção, atualizar na base de dados real

    return NextResponse.json({
      success: true,
      message: "Caption atualizada",
    });
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    );
  }
}