// src/app/api/posts/generate-carousel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { imageGenerationService } from "@/services/media/image-generation.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { slides } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: "Slides são obrigatórios" }, { status: 400 });
    }

    console.log(`🎨 Gerando ${slides.length} imagens para carrossel...`);

    const images = await imageGenerationService.generateCarouselImages(slides);

    // Combinar com dados dos slides
    const carouselSlides = slides.map((slide: any, index: number) => ({
      ...slide,
      imageUrl: images[index]?.imageUrl || '',
    }));

    return NextResponse.json({
      success: true,
      slides: carouselSlides,
    });
  } catch (error: any) {
    console.error("Erro ao gerar carrossel:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao gerar carrossel" },
      { status: 500 }
    );
  }
}