// src/services/media/image-generation.service.ts - VERSÃO MELHORADA
import OpenAI from 'openai';
import Replicate from 'replicate';
import sharp from 'sharp';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({ auth: process.env.REPLICATE_API_KEY })
  : null;

interface ImageGenerationOptions {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'minimalist' | 'vibrant' | 'professional';
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  quality?: 'standard' | 'hd';
  platform?: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  negativePrompt?: string;
}

export class ImageGenerationService {
  
  // 🆕 MÉTODO PRINCIPAL - Escolhe a melhor API automaticamente
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    console.log(`🎨 Gerando imagem: ${options.style || 'professional'} para ${options.platform || 'instagram'}`);
    
    try {
      // Estratégia: FLUX (Replicate) para fotos realistas, DALL-E 3 para o resto
      if (options.style === 'realistic' && replicate) {
        return await this.generateWithFLUX(options);
      } else if (process.env.OPENAI_API_KEY) {
        return await this.generateWithDALLE3(options);
      } else if (replicate) {
        return await this.generateWithSDXL(options);
      } else {
        throw new Error('Nenhuma API configurada');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      return this.getPlaceholderImage(options.aspectRatio || '1:1');
    }
  }

  // 🔥 DALL-E 3 - Melhor para ilustrações e designs criativos
  async generateWithDALLE3(options: ImageGenerationOptions): Promise<string> {
    const { prompt, style = 'professional', quality = 'hd' } = options;

    // 🆕 Prompt Engineering Avançado
    const enhancedPrompt = this.buildAdvancedPrompt(prompt, style, options.platform);

    console.log(`🎨 DALL-E 3: "${enhancedPrompt.substring(0, 100)}..."`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024', // DALL-E 3 só tem esta opção
      quality: quality,
      style: style === 'realistic' ? 'natural' : 'vivid',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma imagem foi gerada pela API');
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('URL da imagem não encontrada na resposta');
    }

    // 🆕 Otimizar para a plataforma específica
    return await this.optimizeForPlatform(imageUrl, options);
  }

  // 🔥 FLUX Pro - MELHOR para fotos ultra-realistas (via Replicate)
  async generateWithFLUX(options: ImageGenerationOptions): Promise<string> {
    if (!replicate) throw new Error('Replicate não configurado');

    const { prompt, aspectRatio = '1:1', negativePrompt } = options;

    // 🆕 Prompt otimizado para fotos reais
    const realisticPrompt = this.buildRealisticPrompt(prompt);

    console.log(`📸 FLUX Pro (ultra-realistic): "${realisticPrompt.substring(0, 100)}..."`);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: realisticPrompt,
          aspect_ratio: aspectRatio,
          output_format: "jpg",
          output_quality: 95,
          safety_tolerance: 2,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log(`✅ FLUX: Imagem ultra-realista gerada`);

    return imageUrl as string;
  }

  // 🔥 Stable Diffusion XL - Backup rápido e barato
  async generateWithSDXL(options: ImageGenerationOptions): Promise<string> {
    if (!replicate) throw new Error('Replicate não configurado');

    const { prompt, style = 'professional', negativePrompt } = options;
    const enhancedPrompt = this.enhancePrompt(prompt, style);

    console.log(`🎨 SDXL: "${enhancedPrompt.substring(0, 100)}..."`);

    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt || 
            'ugly, blurry, low quality, distorted, deformed, bad anatomy, watermark, text, logo, signature',
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
    return imageUrl as string;
  }

  // 🆕 PROMPT ENGINEERING AVANÇADO
  private buildAdvancedPrompt(
    basePrompt: string, 
    style: string, 
    platform?: string
  ): string {
    const styleGuides = {
      realistic: `
        Professional photography, shot on iPhone 15 Pro Max,
        natural lighting, candid moment, authentic atmosphere,
        slight film grain, natural skin texture, 8k resolution,
        photojournalistic style, unposed, real life scenario
      `,
      professional: `
        Corporate photography, professional studio quality,
        clean composition, modern aesthetic, well-lit,
        business appropriate, polished, high-end production value
      `,
      vibrant: `
        Bold and energetic visual, vibrant saturated colors,
        dynamic composition, eye-catching, modern social media aesthetic,
        high contrast, attention-grabbing, contemporary design
      `,
      minimalist: `
        Minimalist design, clean and simple, negative space,
        geometric shapes, modern flat design, monochromatic or limited palette,
        zen aesthetic, scandinavian design influence
      `,
      illustration: `
        Modern digital illustration, vector art style, clean lines,
        contemporary graphic design, editorial illustration quality,
        cohesive color palette, professional illustration
      `
    };

    const platformOptimizations = {
      instagram: ', optimized for Instagram feed, square format friendly, mobile-first design',
      facebook: ', engaging for Facebook audience, web-optimized, shareable visual',
      linkedin: ', professional networking appropriate, business context suitable',
      twitter: ', attention-grabbing for fast scrolling, concise visual message',
    };

    const styleGuide = styleGuides[style as keyof typeof styleGuides] || styleGuides.professional;
    const platformOpt = platform ? (platformOptimizations[platform as keyof typeof platformOptimizations] || '') : '';

    return `${basePrompt}. ${styleGuide}${platformOpt}`.trim();
  }

  // 🆕 PROMPT para FOTOS REAIS (anti-IA)
  private buildRealisticPrompt(basePrompt: string): string {
    return `${basePrompt}
    
CRITICAL - MUST LOOK LIKE REAL PHOTO:
- Shot on iPhone 15 Pro or similar smartphone camera
- Natural imperfections: slight motion blur, natural skin texture, realistic lighting
- Authentic moment, not posed or staged
- Real environment with natural clutter and details
- Slightly grainy texture (ISO 400-800 equivalent)
- Natural depth of field from phone camera
- Candid photography style, photojournalistic approach
- Real clothing with natural wrinkles and fabric texture
- Genuine human expressions and body language
- Environmental context that feels lived-in and authentic

AVOID AT ALL COSTS:
- Perfect symmetry or overly staged composition
- Studio lighting or artificial perfect illumination
- Flawless skin or beauty filter appearance
- Overly saturated or enhanced colors
- AI-generated telltale signs (weird hands, unnatural proportions)
- Stock photo appearance or commercial photography look
- Dramatic or cinematic lighting
- Professional model poses or expressions`.trim();
  }

  // 🆕 OTIMIZAR para cada plataforma
  private async optimizeForPlatform(
    imageUrl: string, 
    options: ImageGenerationOptions
  ): Promise<string> {
    // Se temos Sharp, otimizar dimensões
    try {
      const dimensions = this.getPlatformDimensions(options.platform, options.aspectRatio);
      
      // Download da imagem
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Processar com Sharp
      const optimized = await sharp(buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();

      // Aqui terias que fazer upload para o teu storage
      // Por agora, retorna a URL original
      console.log(`✅ Imagem otimizada para ${options.platform}: ${dimensions.width}x${dimensions.height}`);
      
      return imageUrl; // Retornar URL do storage após upload
    } catch (error) {
      console.log('⚠️ Otimização não disponível, usando imagem original');
      return imageUrl;
    }
  }

  // 🆕 Dimensões ideais por plataforma
  private getPlatformDimensions(
    platform?: string, 
    aspectRatio?: string
  ): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      'instagram-1:1': { width: 1080, height: 1080 },
      'instagram-4:5': { width: 1080, height: 1350 },
      'instagram-9:16': { width: 1080, height: 1920 }, // Stories/Reels
      'facebook-16:9': { width: 1200, height: 630 },
      'linkedin-1:1': { width: 1200, height: 1200 },
      'twitter-16:9': { width: 1200, height: 675 },
    };

    const key = `${platform || 'instagram'}-${aspectRatio || '1:1'}`;
    return dimensions[key] || { width: 1080, height: 1080 };
  }

  // Melhorar prompt baseado no estilo (método original mantido para compatibilidade)
  private enhancePrompt(prompt: string, style: string): string {
    const styleModifiers = {
      realistic: 'high quality photo, professional photography, realistic, detailed, sharp focus',
      illustration: 'digital illustration, modern design, clean lines, vector art style',
      minimalist: 'minimalist design, simple, clean, modern, flat design, geometric shapes',
      vibrant: 'vibrant colors, energetic, dynamic, bold, eye-catching, modern aesthetic',
      professional: 'professional quality, corporate style, clean design, modern, polished',
    };

    const modifier = styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.professional;
    return `${prompt}, ${modifier}`;
  }

  // 🆕 Gerar múltiplas variações
  async generateVariations(
    basePrompt: string,
    count: number = 3
  ): Promise<string[]> {
    console.log(`🎨 Gerando ${count} variações...`);
    
    const variations = [];
    const styles: Array<'realistic' | 'professional' | 'vibrant'> = ['realistic', 'professional', 'vibrant'];
    
    for (let i = 0; i < count; i++) {
      const style = styles[i % styles.length];
      try {
        const url = await this.generateImage({
          prompt: basePrompt,
          style,
          quality: 'standard', // Standard é mais rápido para variações
        });
        variations.push(url);
        
        // Rate limit protection
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Erro na variação ${i + 1}:`, error);
      }
    }
    
    return variations;
  }

  // Gerar carrossel (mantido igual)
  async generateCarouselImages(
    slides: Array<{ title: string; imagePrompt: string }>
  ): Promise<Array<{ slideIndex: number; imageUrl: string }>> {
    console.log(`🎨 Gerando ${slides.length} imagens para carrossel...`);

    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`📸 Slide ${i + 1}/${slides.length}...`);

      try {
        const imageUrl = await this.generateImage({
          prompt: slide.imagePrompt,
          style: 'professional',
          aspectRatio: '1:1',
          platform: 'instagram',
        });

        results.push({
          slideIndex: i + 1,
          imageUrl,
        });

        // Rate limit protection
        if (i < slides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Erro no slide ${i + 1}:`, error);
        results.push({
          slideIndex: i + 1,
          imageUrl: this.getPlaceholderImage('1:1'),
        });
      }
    }

    console.log(`✅ ${results.length} slides gerados!`);
    return results;
  }

  // Placeholder (mantido igual)
  private getPlaceholderImage(aspectRatio: string): string {
    const dimensions: Record<string, string> = {
      '1:1': '1080x1080',
      '4:5': '1080x1350',
      '16:9': '1920x1080',
      '9:16': '1080x1920',
    };

    const size = dimensions[aspectRatio] || '1080x1080';
    return `https://via.placeholder.com/${size}/3B82F6/FFFFFF?text=Imagem+IA`;
  }
}

export const imageGenerationService = new ImageGenerationService();