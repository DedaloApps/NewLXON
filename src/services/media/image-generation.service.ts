// src/services/media/image-generation.service.ts
import OpenAI from 'openai';
import Replicate from 'replicate';

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
  style?: 'realistic' | 'illustration' | 'minimalist' | 'vibrant' | 'professional';
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  quality?: 'standard' | 'hd';
}

export class ImageGenerationService {
  // Gerar imagem com DALL-E 3 (OpenAI)
  async generateWithDALLE(options: ImageGenerationOptions): Promise<string> {
    try {
      const { prompt, style = 'professional', quality = 'hd' } = options;

      // Melhorar prompt baseado no estilo + aparência portuguesa
      const enhancedPrompt = this.enhancePromptWithPortugueseAppearance(prompt, style);

      console.log(`🎨 Gerando imagem com DALL-E: "${enhancedPrompt}"`);

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: quality,
        style: style === 'realistic' ? 'natural' : 'vivid',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('Nenhuma imagem foi gerada');
      }

      const imageUrl = response.data[0].url;
      
      if (!imageUrl) {
        throw new Error('URL da imagem não encontrada');
      }

      console.log(`✅ Imagem gerada: ${imageUrl}`);

      return imageUrl;
    } catch (error) {
      console.error('Erro ao gerar imagem com DALL-E:', error);
      throw error;
    }
  }

  // Gerar imagem com Stable Diffusion XL (Replicate)
  async generateWithSDXL(options: ImageGenerationOptions): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    try {
      const { prompt, style = 'professional', aspectRatio = '1:1' } = options;

      const enhancedPrompt = this.enhancePromptWithPortugueseAppearance(prompt, style);

      console.log(`🎨 Gerando imagem com SDXL: "${enhancedPrompt}"`);

      const output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt:
              'ugly, blurry, low quality, distorted, deformed, disfigured, bad anatomy, indian, south asian, asian features, dark skin',
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: 'K_EULER',
            num_inference_steps: 50,
            guidance_scale: 7.5,
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log(`✅ Imagem gerada: ${imageUrl}`);

      return imageUrl as string;
    } catch (error) {
      console.error('Erro ao gerar imagem com SDXL:', error);
      throw error;
    }
  }

  // Gerar imagem (escolhe automaticamente o melhor serviço)
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    try {
      // Prioridade: DALL-E 3 se disponível, senão SDXL
      if (process.env.OPENAI_API_KEY) {
        return await this.generateWithDALLE(options);
      } else if (process.env.REPLICATE_API_KEY) {
        return await this.generateWithSDXL(options);
      } else {
        throw new Error('Nenhuma API de geração de imagens configurada');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      // Retornar placeholder em caso de erro
      return this.getPlaceholderImage(options.aspectRatio || '1:1');
    }
  }

  // Melhorar prompt baseado no estilo + adicionar aparência portuguesa
  private enhancePromptWithPortugueseAppearance(prompt: string, style: string): string {
    const styleModifiers = {
      realistic:
        'high quality photo, professional photography, realistic, detailed, sharp focus',
      illustration:
        'digital illustration, modern design, clean lines, vector art style',
      minimalist:
        'minimalist design, simple, clean, modern, flat design, geometric shapes',
      vibrant:
        'vibrant colors, energetic, dynamic, bold, eye-catching, modern aesthetic',
      professional:
        'professional quality, corporate style, clean design, modern, polished',
    };

    const modifier = styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.professional;

    // Detectar se o prompt menciona pessoas
    const mentionsPeople = this.detectsPeople(prompt);

    if (mentionsPeople) {
      // Adicionar especificação de aparência europeia/portuguesa
      const appearanceModifier = 'European Portuguese appearance, Mediterranean features, light to olive skin tone, Southern European ethnicity';
      return `${prompt}, ${appearanceModifier}, ${modifier}`;
    }

    return `${prompt}, ${modifier}`;
  }

  // Detectar se o prompt menciona pessoas
  private detectsPeople(prompt: string): boolean {
    const peopleKeywords = [
      'person', 'people', 'man', 'woman', 'men', 'women',
      'person', 'pessoas', 'homem', 'mulher', 'homens', 'mulheres',
      'cliente', 'clientes', 'profissional', 'profissionais',
      'trainer', 'coach', 'teacher', 'student', 'estudante',
      'entrepreneur', 'empreendedor', 'business owner',
      'human', 'face', 'portrait', 'retrato', 'selfie',
      'team', 'equipa', 'group', 'grupo', 'audience', 'público',
      'consultant', 'consultor', 'expert', 'specialist'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return peopleKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  // Placeholder image caso API falhe
  private getPlaceholderImage(aspectRatio: string): string {
    const dimensions: Record<string, string> = {
      '1:1': '1080x1080',
      '4:5': '1080x1350',
      '16:9': '1920x1080',
      '9:16': '1080x1920',
    };

    const size = dimensions[aspectRatio] || '1080x1080';
    return `https://via.placeholder.com/${size}/3B82F6/FFFFFF?text=Imagem+Gerada+por+IA`;
  }

  // Gerar múltiplas imagens para carrossel
  async generateCarouselImages(
    slides: Array<{ title: string; imagePrompt: string }>
  ): Promise<Array<{ slideIndex: number; imageUrl: string }>> {
    console.log(`🎨 Gerando ${slides.length} imagens para carrossel...`);

    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`Gerando slide ${i + 1}/${slides.length}...`);

      try {
        const imageUrl = await this.generateImage({
          prompt: slide.imagePrompt,
          style: 'professional',
          aspectRatio: '1:1',
        });

        results.push({
          slideIndex: i + 1,
          imageUrl,
        });

        // Delay entre requests para evitar rate limits
        if (i < slides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Erro ao gerar slide ${i + 1}:`, error);
        results.push({
          slideIndex: i + 1,
          imageUrl: this.getPlaceholderImage('1:1'),
        });
      }
    }

    console.log(`✅ ${results.length} imagens de carrossel geradas`);
    return results;
  }

  // Otimizar imagem para Instagram
  async optimizeForInstagram(imageUrl: string): Promise<string> {
    // TODO: Implementar com Sharp ou Cloudinary
    // Por agora retorna a URL original
    return imageUrl;
  }
}

export const imageGenerationService = new ImageGenerationService();