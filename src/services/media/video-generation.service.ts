// src/services/media/image-generation.service.ts
import OpenAI from 'openai';
import Replicate from 'replicate';
import { promptEnhancementService } from './prompt-enhancement.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    })
  : null;

interface ImageGenerationOptions {
  prompt: string;
  style?: 'professional' | 'authentic' | 'vibrant' | 'minimalist' | 'luxury';
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  quality?: 'standard' | 'hd';
  
  // NOVO: Suporte para texto em imagens
  includeText?: {
    mainText: string;
    subtext?: string;
    style?: 'bold' | 'elegant' | 'modern' | 'playful';
  };
  
  // NOVO: Contexto de negócio para prompts mais relevantes
  context?: {
    businessType?: string;
    targetAudience?: string;
    contentGoal?: string;
  };
  
  imageType?: 'carousel' | 'post' | 'story' | 'reel-thumbnail';
}

export class ImageGenerationService {
  /**
   * MÉTODO PRINCIPAL MELHORADO - Gera imagens profissionais
   */
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    try {
      console.log('🎨 Iniciando geração de imagem profissional...');
      
      // PASSO 1: Otimizar prompt com IA
      const enhancedPrompt = await promptEnhancementService.enhancePrompt({
        basicPrompt: options.prompt,
        context: options.context,
        imageType: options.imageType || 'post',
        includeText: options.includeText,
        style: options.style || 'professional',
      });

      console.log('✅ Prompt otimizado:', enhancedPrompt.fullPrompt.substring(0, 100) + '...');

      // PASSO 2: Gerar imagem com o melhor serviço disponível
      if (process.env.OPENAI_API_KEY) {
        return await this.generateWithDALLE(enhancedPrompt, options);
      } else if (process.env.REPLICATE_API_KEY) {
        return await this.generateWithSDXL(enhancedPrompt, options);
      } else {
        throw new Error('Nenhuma API de geração de imagens configurada');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      return this.getPlaceholderImage(options.aspectRatio || '1:1');
    }
  }

  /**
   * Gera com DALL-E 3 (melhor para texto e qualidade)
   */
  private async generateWithDALLE(
    enhancedPrompt: any,
    options: ImageGenerationOptions
  ): Promise<string> {
    console.log('🎨 Gerando com DALL-E 3...');

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt.fullPrompt,
      n: 1,
      size: this.getDallESize(options.aspectRatio),
      quality: enhancedPrompt.quality || 'hd',
      style: enhancedPrompt.dalleStyle,
    });

    if (!response.data?.[0]?.url) {
      throw new Error('URL da imagem não encontrada');
    }

    console.log('✅ Imagem DALL-E gerada com sucesso');
    return response.data[0].url;
  }

  /**
   * Gera com Stable Diffusion XL (alternativa)
   */
  private async generateWithSDXL(
    enhancedPrompt: any,
    options: ImageGenerationOptions
  ): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    console.log('🎨 Gerando com SDXL...');

    const { width, height } = this.getDimensions(options.aspectRatio || '1:1');

    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: enhancedPrompt.fullPrompt,
          negative_prompt: enhancedPrompt.negativePrompt,
          width,
          height,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 50,
          guidance_scale: 7.5,
          refine: 'expert_ensemble_refiner',
          apply_watermark: false,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Imagem SDXL gerada com sucesso');
    return imageUrl as string;
  }

  /**
   * NOVO MÉTODO: Gerar carrossel profissional completo
   */
  async generateCarouselImages(
    slides: Array<{
      title: string;
      content: string;
      imagePrompt: string;
      includeText?: boolean;
    }>,
    context?: any
  ): Promise<Array<{ slideIndex: number; imageUrl: string }>> {
    console.log(`🎨 Gerando ${slides.length} imagens profissionais para carrossel...`);
    
    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`📸 Slide ${i + 1}/${slides.length}: "${slide.title}"`);

      try {
        const imageUrl = await this.generateImage({
          prompt: slide.imagePrompt,
          style: 'professional',
          aspectRatio: '1:1',
          imageType: 'carousel',
          context,
          ...(slide.includeText && {
            includeText: {
              mainText: slide.title,
              style: 'bold',
            },
          }),
        });

        results.push({
          slideIndex: i + 1,
          imageUrl,
        });

        // Delay entre requests
        if (i < slides.length - 1) {
          console.log('⏳ Aguardando 2 segundos...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar slide ${i + 1}:`, error);
        results.push({
          slideIndex: i + 1,
          imageUrl: this.getPlaceholderImage('1:1'),
        });
      }
    }

    console.log(`✅ ${results.length} imagens geradas com sucesso!`);
    return results;
  }

  /**
   * NOVO MÉTODO: Gerar imagem para Story com texto
   */
  async generateStoryImage(options: {
    content: string;
    mainText: string;
    subtext?: string;
    context?: any;
  }): Promise<string> {
    return this.generateImage({
      prompt: options.content,
      aspectRatio: '9:16',
      imageType: 'story',
      style: 'vibrant',
      includeText: {
        mainText: options.mainText,
        subtext: options.subtext,
        style: 'bold',
      },
      context: options.context,
    });
  }

  /**
   * NOVO MÉTODO: Gerar thumbnail para Reel
   */
  async generateReelThumbnail(options: {
    content: string;
    title: string;
    context?: any;
  }): Promise<string> {
    return this.generateImage({
      prompt: options.content,
      aspectRatio: '9:16',
      imageType: 'reel-thumbnail',
      style: 'vibrant',
      includeText: {
        mainText: options.title,
        style: 'bold',
      },
      context: options.context,
    });
  }

  // ============ MÉTODOS AUXILIARES ============

  private getDallESize(aspectRatio?: string): '1024x1024' | '1792x1024' | '1024x1792' {
    const sizes = {
      '1:1': '1024x1024' as const,
      '4:5': '1024x1024' as const, // DALL-E não suporta 4:5, usa 1:1
      '16:9': '1792x1024' as const,
      '9:16': '1024x1792' as const,
    };
    return sizes[aspectRatio as keyof typeof sizes] || '1024x1024';
  }

  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const dimensions = {
      '1:1': { width: 1024, height: 1024 },
      '4:5': { width: 1024, height: 1280 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
    };
    return dimensions[aspectRatio as keyof typeof dimensions] || dimensions['1:1'];
  }

  private getPlaceholderImage(aspectRatio: string): string {
    const dimensions: Record<string, string> = {
      '1:1': '1080x1080',
      '4:5': '1080x1350',
      '16:9': '1920x1080',
      '9:16': '1080x1920',
    };

    const size = dimensions[aspectRatio] || '1080x1080';
    return `https://via.placeholder.com/${size}/3B82F6/FFFFFF?text=Imagem+Profissional`;
  }

  /**
   * FUTURO: Otimizar imagem para Instagram
   */
  async optimizeForInstagram(imageUrl: string): Promise<string> {
    // TODO: Implementar com Sharp ou Cloudinary
    // - Comprimir para tamanho ideal
    // - Ajustar cores para Instagram
    // - Adicionar filtros se necessário
    return imageUrl;
  }
}

export const imageGenerationService = new ImageGenerationService();