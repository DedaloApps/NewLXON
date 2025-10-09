// src/services/media/prompt-enhancement.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptEnhancementOptions {
  basicPrompt: string;
  context?: {
    businessType?: string;
    targetAudience?: string;
    contentGoal?: string;
  };
  imageType: 'carousel' | 'post' | 'story' | 'reel-thumbnail';
  includeText?: {
    mainText: string;
    subtext?: string;
    style?: 'bold' | 'elegant' | 'modern' | 'playful';
  };
  style?: 'professional' | 'authentic' | 'vibrant' | 'minimalist' | 'luxury';
}

interface EnhancedPrompt {
  fullPrompt: string;
  negativePrompt: string;
  dalleStyle: 'natural' | 'vivid';
  quality: 'standard' | 'hd';
}

export class PromptEnhancementService {
  /**
   * MÉTODO PRINCIPAL: Otimiza prompts simples em prompts profissionais
   */
  async enhancePrompt(options: PromptEnhancementOptions): Promise<EnhancedPrompt> {
    const {
      basicPrompt,
      context,
      imageType,
      includeText,
      style = 'professional',
    } = options;

    // Se incluir texto, usa IA para gerar prompt otimizado
    if (includeText) {
      return await this.generateTextBasedPrompt(options);
    }

    // Caso contrário, otimiza o prompt básico
    return this.optimizeBasicPrompt(basicPrompt, style, imageType, context);
  }

  /**
   * Gera prompts para imagens com texto usando GPT-4
   */
  private async generateTextBasedPrompt(
    options: PromptEnhancementOptions
  ): Promise<EnhancedPrompt> {
    const { basicPrompt, includeText, style, imageType, context } = options;

    const systemPrompt = `És um expert em design gráfico e marketing visual. 
Crias prompts detalhados para DALL-E 3 que geram imagens profissionais com texto LEGÍVEL e bem integrado.

REGRAS CRÍTICAS PARA TEXTO LEGÍVEL:
1. Sempre especifica: "bold, clear, readable typography"
2. Define contraste: "high contrast text on [cor] background"
3. Hierarquia visual clara: tamanho e peso das fontes
4. Layout profissional: espaçamento, alinhamento
5. Fonte apropriada ao estilo (sans-serif para moderno, serif para elegante)

EVITA:
- Texto pequeno ou ilegível
- Baixo contraste
- Fontes decorativas complexas
- Sobreposição confusa`;

    const userPrompt = `Cria um prompt profissional para DALL-E 3 que gere uma imagem de ${imageType} para ${context?.businessType || 'negócio'}.

CONTEXTO:
- Prompt base: "${basicPrompt}"
- Estilo desejado: ${style}
- Público-alvo: ${context?.targetAudience || 'geral'}
- Objetivo: ${context?.contentGoal || 'engagement'}

TEXTO A INCLUIR NA IMAGEM:
- Texto principal: "${includeText?.mainText}"
${includeText?.subtext ? `- Subtexto: "${includeText.subtext}"` : ''}
- Estilo de texto: ${includeText?.style || 'modern'}

FORMATO DE RESPOSTA (JSON):
{
  "fullPrompt": "prompt detalhado com instruções específicas para texto legível",
  "negativePrompt": "elementos a evitar",
  "dalleStyle": "natural ou vivid",
  "quality": "hd"
}

O prompt deve ser extremamente detalhado e profissional, garantindo que o texto seja PERFEITAMENTE LEGÍVEL.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        fullPrompt: response.fullPrompt || this.getFallbackPrompt(options),
        negativePrompt: response.negativePrompt || this.getDefaultNegativePrompt(),
        dalleStyle: response.dalleStyle || 'vivid',
        quality: 'hd',
      };
    } catch (error) {
      console.error('Erro ao gerar prompt com IA:', error);
      return this.getFallbackPrompt(options);
    }
  }

  /**
   * Otimiza prompt básico sem texto
   */
  private optimizeBasicPrompt(
    basicPrompt: string,
    style: string,
    imageType: string,
    context?: any
  ): EnhancedPrompt {
    const styleEnhancements = this.getStyleEnhancements(style);
    const imageTypeSpecs = this.getImageTypeSpecs(imageType);
    const contextualDetails = this.getContextualDetails(context);

    const fullPrompt = [
      basicPrompt,
      styleEnhancements,
      imageTypeSpecs,
      contextualDetails,
      'professional photography, high quality, sharp focus, well-composed, proper lighting',
    ]
      .filter(Boolean)
      .join(', ');

    return {
      fullPrompt,
      negativePrompt: this.getDefaultNegativePrompt(),
      dalleStyle: style === 'professional' || style === 'authentic' ? 'natural' : 'vivid',
      quality: 'hd',
    };
  }

  /**
   * Melhorias de estilo detalhadas
   */
  private getStyleEnhancements(style: string): string {
    const enhancements: Record<string, string> = {
      professional:
        'corporate aesthetic, clean lines, modern design, professional color palette, polished finish, studio quality, minimalist composition, business-appropriate',
      
      authentic:
        'natural lighting, candid feel, genuine atmosphere, realistic textures, organic composition, relatable scene, honest representation, lifestyle photography style',
      
      vibrant:
        'bold saturated colors, energetic composition, dynamic angles, eye-catching contrast, vivid tones, attention-grabbing, modern color grading, Instagram-worthy aesthetic',
      
      minimalist:
        'simple composition, clean background, negative space, geometric shapes, limited color palette, Scandinavian design influence, uncluttered, focus on essentials',
      
      luxury:
        'premium materials, elegant composition, sophisticated color palette, high-end aesthetic, refined details, upscale ambiance, polished finish, editorial quality',
    };

    return enhancements[style] || enhancements.professional;
  }

  /**
   * Especificações por tipo de imagem
   */
  private getImageTypeSpecs(imageType: string): string {
    const specs: Record<string, string> = {
      carousel:
        'Instagram carousel format, cohesive visual story, consistent style across series, educational layout, infographic elements if relevant',
      
      post:
        'Instagram feed optimization, square composition, thumb-stopping visual, engaging focal point, mobile-first design',
      
      story:
        'vertical 9:16 format, story-friendly layout, quick visual impact, mobile viewing optimized, swipe-up ready if applicable',
      
      'reel-thumbnail':
        'attention-grabbing thumbnail, clear visual hierarchy, works at small size, enticing preview, YouTube/Instagram reel optimized',
    };

    return specs[imageType] || specs.post;
  }

  /**
   * Detalhes contextuais baseados no negócio
   */
  private getContextualDetails(context?: any): string {
    if (!context?.businessType) return '';

    const contextMap: Record<string, string> = {
      fitness:
        'motivational energy, athletic aesthetics, health-focused, gym environment or outdoor setting',
      
      food:
        'appetizing presentation, food photography lighting, culinary appeal, restaurant quality plating',
      
      fashion:
        'fashion editorial style, trendy aesthetics, style-conscious composition, boutique quality',
      
      tech:
        'modern tech aesthetic, innovation vibe, clean digital design, futuristic elements',
      
      beauty:
        'beauty product photography standards, skincare aesthetic, cosmetic appeal, spa-like quality',
      
      coaching:
        'inspirational atmosphere, growth mindset visual, professional consulting vibe, trustworthy presence',
    };

    return contextMap[context.businessType.toLowerCase()] || '';
  }

  /**
   * Negative prompt padrão para qualidade profissional
   */
  private getDefaultNegativePrompt(): string {
    return [
      'blurry, low quality, pixelated, distorted',
      'amateur, unprofessional, poorly lit',
      'watermark, signature, text artifacts',
      'deformed, disfigured, bad anatomy',
      'cartoon, anime, 3D render (unless specifically wanted)',
      'overly processed, artificial look, fake',
      'cluttered, messy composition',
      'stock photo feel, generic, cliche',
    ].join(', ');
  }

  /**
   * Prompt de fallback caso IA falhe
   */
  private getFallbackPrompt(options: PromptEnhancementOptions): EnhancedPrompt {
    const { basicPrompt, includeText, style } = options;

    let textInstructions = '';
    if (includeText) {
      textInstructions = `, featuring bold readable text "${includeText.mainText}" in ${
        includeText.style || 'modern'
      } typography with high contrast, clear legibility, professional font choice`;
    }

    const styleDesc = this.getStyleEnhancements(style || 'professional');

    return {
      fullPrompt: `${basicPrompt}${textInstructions}, ${styleDesc}, professional quality, high resolution, sharp focus`,
      negativePrompt: this.getDefaultNegativePrompt(),
      dalleStyle: 'vivid',
      quality: 'hd',
    };
  }

  /**
   * MÉTODO AUXILIAR: Gera múltiplos prompts para carrossel
   */
  async generateCarouselPrompts(slides: Array<{
    title: string;
    content: string;
    includeText?: boolean;
  }>, context?: any): Promise<Array<EnhancedPrompt>> {
    const prompts: EnhancedPrompt[] = [];

    for (const slide of slides) {
      const options: PromptEnhancementOptions = {
        basicPrompt: slide.content,
        context,
        imageType: 'carousel',
        style: 'professional',
        ...(slide.includeText && {
          includeText: {
            mainText: slide.title,
            style: 'bold',
          },
        }),
      };

      const enhancedPrompt = await this.enhancePrompt(options);
      prompts.push(enhancedPrompt);

      // Delay para evitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return prompts;
  }
}

export const promptEnhancementService = new PromptEnhancementService();