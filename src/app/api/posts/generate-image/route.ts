// src/app/api/posts/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { imageGenerationService } from '@/services/media/image-generation.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      prompt,
      style = 'professional',
      aspectRatio = '1:1',
      imageType = 'post',
      includeText,
      context,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🎨 Gerando imagem profissional...');

    const imageUrl = await imageGenerationService.generateImage({
      prompt,
      style,
      aspectRatio,
      imageType,
      includeText,
      context,
    });

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar imagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagem' },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLOS DE USO NO FRONTEND
// ============================================

/**
 * EXEMPLO 1: Gerar post simples sem texto
 */
async function generateSimplePost() {
  const response = await fetch('/api/posts/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Pessoa fazendo treino de força na academia',
      style: 'professional',
      aspectRatio: '1:1',
      context: {
        businessType: 'fitness',
        targetAudience: 'adultos 25-45 anos',
        contentGoal: 'inspiração para treinar',
      },
    }),
  });

  const data = await response.json();
  console.log('Imagem gerada:', data.imageUrl);
}

/**
 * EXEMPLO 2: Gerar post COM TEXTO LEGÍVEL
 */
async function generatePostWithText() {
  const response = await fetch('/api/posts/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Academia moderna com equipamentos de última geração',
      style: 'professional',
      aspectRatio: '1:1',
      imageType: 'post',
      
      // NOVO: Adicionar texto à imagem
      includeText: {
        mainText: 'TREINO GRÁTIS',
        subtext: 'Esta semana apenas',
        style: 'bold',
      },
      
      context: {
        businessType: 'fitness',
        targetAudience: 'adultos 25-45 anos',
        contentGoal: 'conversão de leads',
      },
    }),
  });

  const data = await response.json();
  console.log('Post com texto gerado:', data.imageUrl);
}

/**
 * EXEMPLO 3: Gerar Story com texto
 */
async function generateStory() {
  const response = await fetch('/api/posts/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Smoothie de proteína saudável com frutas',
      style: 'vibrant',
      aspectRatio: '9:16',
      imageType: 'story',
      
      includeText: {
        mainText: 'RECEITA DO DIA',
        subtext: 'Desliza para ver →',
        style: 'modern',
      },
      
      context: {
        businessType: 'fitness',
        contentGoal: 'engagement',
      },
    }),
  });

  const data = await response.json();
  console.log('Story gerado:', data.imageUrl);
}