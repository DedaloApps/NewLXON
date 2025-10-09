// src/app/api/posts/generate-carousel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { imageGenerationService } from '@/services/media/image-generation.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { slides, context, includeTextInImages = false } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: 'Slides são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`🎨 Gerando ${slides.length} imagens profissionais para carrossel...`);
    console.log('📋 Contexto:', context);

    // Adicionar flag de texto se necessário
    const slidesWithTextFlag = slides.map((slide: any) => ({
      ...slide,
      includeText: includeTextInImages,
    }));

    // Gerar todas as imagens com o novo sistema
    const images = await imageGenerationService.generateCarouselImages(
      slidesWithTextFlag,
      context
    );

    // Combinar imagens geradas com dados dos slides
    const carouselSlides = slides.map((slide: any, index: number) => ({
      ...slide,
      imageUrl: images[index]?.imageUrl || '',
    }));

    console.log('✅ Carrossel gerado com sucesso!');

    return NextResponse.json({
      success: true,
      slides: carouselSlides,
      totalSlides: carouselSlides.length,
      metadata: {
        generatedAt: new Date().toISOString(),
        includesText: includeTextInImages,
        context,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar carrossel:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao gerar carrossel',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}