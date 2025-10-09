// src/services/media/prompt-enhancement.service.ts
// SUBSTITUIR COMPLETAMENTE O FICHEIRO EXISTENTE

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
   * NOVO: Sistema anti-IA - Torna imagens indistinguíveis de fotos reais
   */
  private getAntiAIModifiers(hasPeople: boolean): string {
    const baseRealism = [
      'professional DSLR camera photograph',
      'shot on Canon EOS R5',
      'natural lighting',
      'authentic scene',
      'candid photography',
      '85mm f/1.8 lens',
      'shallow depth of field',
      'natural color grading',
      'photojournalistic style',
      'documentary photography',
      'real-world setting',
    ];

    if (hasPeople) {
      return [
        ...baseRealism,
        // CRÍTICO para pessoas realistas
        'real person',
        'authentic human features',
        'natural skin texture',
        'realistic facial features',
        'genuine expression',
        'natural body proportions',
        'real-life scenario',
        'lifestyle photography',
        'caught in the moment',
        'natural pose',
        'real clothing and materials',
        'authentic environment interaction',
      ].join(', ');
    }

    return baseRealism.join(', ');
  }

  /**
   * Negative prompt ULTRA-FORTE para evitar aspecto de IA
   */
  private getUltraRealisticNegativePrompt(): string {
    return [
      // Anti-IA
      'artificial', 'AI-generated', 'synthetic', 'computer generated', 'digital art',
      'CGI', '3D render', 'illustration', 'drawing', 'painting', 'cartoon',
      'anime', 'manga', 'sketch', 'vector', 'graphic design',
      
      // Anti-pessoas fake
      'plastic skin', 'doll-like', 'mannequin', 'wax figure', 'robot',
      'uncanny valley', 'fake person', 'artificial human',
      'smooth skin', 'perfect skin', 'porcelain skin',
      'airbrushed', 'photoshopped face', 'fake smile',
      
      // Anti-qualidade baixa
      'blurry', 'low quality', 'pixelated', 'distorted', 'deformed',
      'bad anatomy', 'wrong proportions', 'mutated', 'disfigured',
      'ugly', 'poorly rendered', 'amateur',
      
      // Anti-elementos óbvios de IA
      'oversaturated', 'overprocessed', 'fake lighting', 'studio backdrop',
      'generic stock photo', 'cliché pose', 'staged',
      'perfect composition', 'too clean', 'unrealistic colors',
      
      // Problemas técnicos
      'watermark', 'signature', 'text overlay', 'logo',
      'duplicate', 'multiple people', 'extra limbs', 'missing fingers',
    ].join(', ');
  }

  /**
   * Detecta se o prompt menciona pessoas
   */
  private hasPeopleInPrompt(prompt: string): boolean {
    const peopleKeywords = [
      'person', 'people', 'man', 'woman', 'trainer', 'athlete',
      'coach', 'client', 'customer', 'human', 'face', 'portrait',
      'someone', 'individual', 'professional', 'worker',
      'girl', 'boy', 'adult', 'student', 'teacher'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return peopleKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * MÉTODO PRINCIPAL MELHORADO
   */
  async enhancePrompt(options: PromptEnhancementOptions): Promise<EnhancedPrompt> {
    const {
      basicPrompt,
      context,
      imageType,
      includeText,
      style = 'professional',
    } = options;

    // Detectar se tem pessoas no prompt
    const hasPeople = this.hasPeopleInPrompt(basicPrompt);

    // Se incluir texto, usa IA para gerar prompt otimizado
    if (includeText) {
      return await this.generateTextBasedPrompt(options, hasPeople);
    }

    // Caso contrário, cria prompt ultra-realista manualmente
    return this.createUltraRealisticPrompt(basicPrompt, style, imageType, context, hasPeople);
  }

  /**
   * Cria prompt ultra-realista sem IA (mais rápido)
   */
  private createUltraRealisticPrompt(
    basicPrompt: string,
    style: string,
    imageType: string,
    context: any,
    hasPeople: boolean
  ): EnhancedPrompt {
    // Modific adores anti-IA
    const antiAI = this.getAntiAIModifiers(hasPeople);
    
    // Especificações técnicas de fotografia real
    const photoSpecs = [
      'natural lighting',
      'authentic colors',
      'real environment',
      'high resolution',
      '8K quality',
      'sharp focus',
      'professional photography',
    ].join(', ');

    // Construir prompt final
    const fullPrompt = [
      basicPrompt,
      antiAI,
      photoSpecs,
      this.getContextualRealism(context),
    ].filter(Boolean).join('. ');

    return {
      fullPrompt,
      negativePrompt: this.getUltraRealisticNegativePrompt(),
      dalleStyle: 'natural', // SEMPRE natural para realismo
      quality: 'hd',
    };
  }

  /**
   * Adiciona realismo contextual
   */
  private getContextualRealism(context?: any): string {
    if (!context?.businessType) return '';

    const realisticContexts: Record<string, string> = {
      fitness: 'Real gym environment, authentic workout setting, natural athletic movement, genuine fitness atmosphere',
      food: 'Real restaurant or kitchen, authentic food presentation, natural dining environment, genuine culinary setting',
      fashion: 'Real boutique or outdoor setting, authentic fashion scene, natural model poses, genuine style environment',
      beauty: 'Real salon or natural setting, authentic beauty scenario, genuine skincare moment, real-life beauty routine',
      tech: 'Real office or workspace, authentic tech environment, genuine professional setting, natural work scenario',
      coaching: 'Real consultation space, authentic mentoring moment, genuine professional interaction, natural coaching environment',
    };

    return realisticContexts[context.businessType.toLowerCase()] || '';
  }

  /**
   * Gera prompts para imagens com texto (usa GPT-4)
   */
  private async generateTextBasedPrompt(
    options: PromptEnhancementOptions,
    hasPeople: boolean
  ): Promise<EnhancedPrompt> {
    const { basicPrompt, includeText, style, imageType, context } = options;

    const systemPrompt = `És um fotógrafo profissional e expert em direção de arte.
Crias prompts que geram imagens INDISTINGUÍVEIS de fotografias reais.

REGRAS CRÍTICAS:
1. SEMPRE começar com "Professional DSLR photograph"
2. Especificar câmera e lente (Canon EOS R5, 85mm f/1.8)
3. Iluminação NATURAL apenas
4. Ambientes e pessoas REAIS
5. Texturas e detalhes naturais
6. Zero elementos artificiais ou "perfeitos"
${hasPeople ? '7. PESSOAS REAIS: pele com textura, expressões genuínas, poses naturais' : ''}

PARA TEXTO NA IMAGEM:
- Fonte bold e legível
- Alto contraste
- Integrado naturalmente na composição
- Parece adicionado profissionalmente, não gerado por IA`;

    const userPrompt = `Cria um prompt ULTRA-REALISTA para DALL-E 3:

CONTEXTO:
- Cena base: "${basicPrompt}"
- Estilo: ${style}
- Tipo: ${imageType}
- Negócio: ${context?.businessType || 'geral'}

TEXTO NA IMAGEM:
- Principal: "${includeText?.mainText}"
${includeText?.subtext ? `- Secundário: "${includeText.subtext}"` : ''}

O prompt DEVE:
1. Começar com especificações de câmera profissional
2. Descrever cena realista e autêntica
3. Incluir instruções para texto legível e bem integrado
4. Evitar qualquer elemento que pareça IA ou sintético
${hasPeople ? '5. Pessoa REAL com textura de pele natural e expressão genuína' : ''}

Retorna JSON:
{
  "fullPrompt": "prompt detalhado ultra-realista",
  "negativePrompt": "tudo a evitar",
  "dalleStyle": "natural",
  "quality": "hd"
}`;

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
        fullPrompt: response.fullPrompt || this.createUltraRealisticPrompt(basicPrompt, style || 'professional', imageType, context, hasPeople).fullPrompt,
        negativePrompt: this.getUltraRealisticNegativePrompt(),
        dalleStyle: 'natural',
        quality: 'hd',
      };
    } catch (error) {
      console.error('Erro ao gerar prompt com IA:', error);
      return this.createUltraRealisticPrompt(basicPrompt, style || 'professional', imageType, context, hasPeople);
    }
  }
}

export const promptEnhancementService = new PromptEnhancementService();