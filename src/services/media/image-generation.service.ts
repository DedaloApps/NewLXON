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
  // Gerar imagem ULTRA-REALISTA com Flux Pro 1.1 (MELHOR QUALIDADE)
  async generateWithFluxPro(options: ImageGenerationOptions): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    try {
      const { prompt, style = 'professional', aspectRatio = '1:1' } = options;

      // Prompt ultra-otimizado para realismo fotográfico
      const ultraRealisticPrompt = this.createUltraRealisticPrompt(prompt, style);

      console.log(`🎨 Gerando imagem ULTRA-REALISTA com Flux Pro 1.1...`);
      console.log(`📝 Prompt: "${ultraRealisticPrompt}"`);

      const output = await replicate.run(
        "black-forest-labs/flux-1.1-pro",
        {
          input: {
            prompt: ultraRealisticPrompt,
            aspect_ratio: aspectRatio,
            output_format: "png",
            output_quality: 100,
            safety_tolerance: 2,
            prompt_upsampling: true, // Melhora automaticamente o prompt
          }
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log(`✅ Imagem ULTRA-REALISTA gerada: ${imageUrl}`);

      return imageUrl as string;
    } catch (error) {
      console.error('Erro ao gerar imagem com Flux Pro:', error);
      throw error;
    }
  }

  // Gerar com Flux Dev (alternativa gratuita)
  async generateWithFluxDev(options: ImageGenerationOptions): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    try {
      const { prompt, style = 'professional', aspectRatio = '1:1' } = options;
      const ultraRealisticPrompt = this.createUltraRealisticPrompt(prompt, style);

      console.log(`🎨 Gerando imagem com Flux Dev...`);

      const output = await replicate.run(
        "black-forest-labs/flux-dev",
        {
          input: {
            prompt: ultraRealisticPrompt,
            guidance: 3.5,
            num_outputs: 1,
            aspect_ratio: aspectRatio,
            output_format: "png",
            output_quality: 100,
            prompt_upsampling: true,
            num_inference_steps: 50, // Mais passos = melhor qualidade
          }
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log(`✅ Imagem gerada: ${imageUrl}`);

      return imageUrl as string;
    } catch (error) {
      console.error('Erro ao gerar imagem com Flux Dev:', error);
      throw error;
    }
  }

  // Criar prompt ultra-realista SEM PARECER IA
  private createUltraRealisticPrompt(basePrompt: string, style: string): string {
    // SINAIS DE IA A EVITAR:
    // - Pele perfeita demais (sem poros, textura)
    // - Iluminação dramática artificial
    // - Cores saturadas irrealistas
    // - Composição "too perfect"
    // - Olhar "vazio" ou artificial
    // - Cabelo perfeito demais
    // - Falta de imperfeições naturais

    const antiAIKeywords = [
      'authentic photography',
      'real photograph',
      'shot with iPhone 15 Pro',
      'candid moment',
      'natural imperfections',
      'real skin texture with pores',
      'natural blemishes',
      'realistic skin',
      'unretouched',
      'raw photo',
      'amateur photography aesthetic',
      'slightly grainy',
      'natural lighting',
      'authentic moment',
      'real life scene',
      'documentary style',
      'street photography aesthetic',
    ];

    // Imperfeições naturais que fazem parecer REAL
    const realismDetails = [
      'visible skin pores and texture',
      'natural skin tone variation',
      'subtle wrinkles',
      'real human proportions',
      'natural shadows',
      'ambient occlusion',
      'slight lens distortion',
      'natural depth of field',
      'realistic eye reflections',
      'natural hair texture',
      'casual pose',
      'relaxed expression',
      'environmental context',
    ];

    // Modificadores por estilo (mas sempre mantendo naturalidade)
    const styleEnhancements: Record<string, string[]> = {
      realistic: [
        'smartphone photography',
        'natural window light',
        'slightly underexposed',
        'real world setting',
        'lived-in environment',
        'authentic background',
      ],
      professional: [
        'professional headshot',
        'corporate setting',
        'natural office lighting',
        'real business environment',
        'subtle retouching only',
      ],
      vibrant: [
        'natural vibrant colors',
        'good natural lighting',
        'outdoor daylight',
        'real location',
      ],
      minimalist: [
        'simple real background',
        'natural light',
        'minimal setup',
        'authentic setting',
      ],
      illustration: [
        'stylized but believable',
        'based on real photography',
      ],
    };

    // CRITICAL: Negative prompts para ELIMINAR sinais de IA
    const aiTellsToAvoid = [
      'no AI generated look',
      'no perfect skin',
      'no plastic appearance',
      'no CGI',
      'no 3D render',
      'no artificial lighting',
      'no overly dramatic lighting',
      'no HDR effect',
      'no oversaturated colors',
      'no perfect symmetry',
      'no doll-like features',
      'no uncanny valley',
      'no floating hair',
      'no weird hands',
      'no distorted anatomy',
      'no synthetic texture',
      'no airbrush effect',
      'no beauty filter look',
      'no Instagram filter appearance',
      'no FaceApp aesthetic',
      'no too perfect composition',
      'no studio portrait look',
      'not overly polished',
    ];

    // Adicionar contexto real
    const contextualRealism = [
      'real environment',
      'natural background',
      'everyday setting',
      'authentic atmosphere',
      'believable scenario',
    ];

    const selectedEnhancements = styleEnhancements[style] || styleEnhancements.realistic;

    // Construir prompt ANTI-IA
    const enhancedPrompt = [
      basePrompt,
      antiAIKeywords.slice(0, 4).join(', '),
      realismDetails.slice(0, 6).join(', '),
      selectedEnhancements.slice(0, 3).join(', '),
      contextualRealism.slice(0, 3).join(', '),
    ].join(', ');

    // Adicionar negative prompts CRÍTICOS
    const finalPrompt = `${enhancedPrompt}. Important: ${aiTellsToAvoid.join(', ')}`;

    return finalPrompt;
  }

  // Gerar imagem com DALL-E 3 (fallback)
  async generateWithDALLE(options: ImageGenerationOptions): Promise<string> {
    try {
      const { prompt, style = 'professional', quality = 'hd' } = options;
      const enhancedPrompt = this.createUltraRealisticPrompt(prompt, style);

      console.log(`🎨 Gerando imagem com DALL-E 3...`);

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt.substring(0, 4000), // DALL-E tem limite de caracteres
        n: 1,
        size: '1024x1024',
        quality: quality,
        style: 'natural', // Sempre natural para realismo
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

  // Gerar imagem (escolhe automaticamente o melhor serviço)
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    try {
      // PRIORIDADE:
      // 1. Flux Pro 1.1 (MELHOR QUALIDADE - realista)
      // 2. Flux Dev (Boa qualidade - gratuito)
      // 3. DALL-E 3 (Fallback)
      
      if (process.env.REPLICATE_API_KEY) {
        try {
          // Tentar Flux Pro primeiro (melhor qualidade)
          return await this.generateWithFluxPro(options);
        } catch (error) {
          console.log('Flux Pro falhou, tentando Flux Dev...');
          // Se falhar, tentar Flux Dev
          return await this.generateWithFluxDev(options);
        }
      } else if (process.env.OPENAI_API_KEY) {
        return await this.generateWithDALLE(options);
      } else {
        throw new Error('Nenhuma API de geração de imagens configurada');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return this.getPlaceholderImage(options.aspectRatio || '1:1');
    }
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
    console.log(`🎨 Gerando ${slides.length} imagens ULTRA-REALISTAS para carrossel...`);

    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`Gerando slide ${i + 1}/${slides.length}...`);

      try {
        const imageUrl = await this.generateImage({
          prompt: slide.imagePrompt,
          style: 'realistic', // Sempre realista para melhor qualidade
          aspectRatio: '1:1',
        });

        results.push({
          slideIndex: i + 1,
          imageUrl,
        });

        // Delay entre requests para evitar rate limits
        if (i < slides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 segundos entre cada
        }
      } catch (error) {
        console.error(`Erro ao gerar slide ${i + 1}:`, error);
        results.push({
          slideIndex: i + 1,
          imageUrl: this.getPlaceholderImage('1:1'),
        });
      }
    }

    console.log(`✅ ${results.length} imagens ULTRA-REALISTAS geradas`);
    return results;
  }

  // Otimizar imagem para Instagram (se necessário)
  async optimizeForInstagram(imageUrl: string): Promise<string> {
    // TODO: Implementar com Sharp ou Cloudinary se necessário
    return imageUrl;
  }
}

export const imageGenerationService = new ImageGenerationService();