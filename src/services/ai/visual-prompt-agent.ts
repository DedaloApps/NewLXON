// src/services/ai/visual-prompt-agent.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BusinessContext {
  business: string;
  businessDescription: string;
  audience: string;
  objective: string;
  tone: string;
}

interface VisualPromptResult {
  category: 'product' | 'service' | 'lifestyle' | 'person' | 'location' | 'abstract';
  visualElements: string[];
  photographyStyle: string;
  promptTemplate: string;
}

export class VisualPromptAgent {
  private systemPrompt = `Tu és um Visual Prompt Engineer especialista.
Analisas negócios e crias prompts de imagem e vídeo ULTRA-PROFISSIONAIS e REALISTAS.
Pensas como um diretor de fotografia e videografia comercial com 15+ anos de experiência.

REGRAS CRÍTICAS:
1. SEMPRE identifica os elementos visuais principais do negócio
2. NUNCA uses conceitos genéricos ou abstratos
3. Foca em fotografia/videografia comercial de alta qualidade
4. Prioriza realismo absoluto (não ilustrações ou renders)
5. Inclui detalhes técnicos de produção profissional`;

  /**
   * Analisa o negócio e cria estratégia visual
   */
  async analyzeBusinessVisuals(context: BusinessContext): Promise<VisualPromptResult> {
    const prompt = `Analisa este negócio e define a estratégia visual:

NEGÓCIO:
- Tipo: ${context.business}
- Descrição: ${context.businessDescription}
- Público: ${context.audience}
- Objetivo: ${context.objective}
- Tom: ${context.tone}

TAREFA:
Identifica:
1. Categoria visual principal (produto físico, serviço, lifestyle, pessoa, local, abstrato)
2. 5-8 elementos visuais específicos que DEVEM aparecer nas fotos/vídeos
3. Estilo de fotografia/videografia ideal (product photography, lifestyle, portrait, architectural, etc)
4. Template de prompt base para este negócio

EXEMPLOS:
- Canetas → categoria: product, elementos: [canetas, escrita, papel, mãos, documentos], estilo: product photography macro
- Ginásio → categoria: location, elementos: [equipamento, pessoas a treinar, espaço, movimento, suor], estilo: lifestyle fitness photography
- Coach → categoria: person, elementos: [pessoa profissional, ambiente inspirador, gestos, expressões], estilo: professional portrait
- Padaria → categoria: product, elementos: [pão fresco, forno, mãos amassando, farinha, vapor], estilo: artisanal food photography

Retorna JSON:
{
  "category": "product|service|lifestyle|person|location|abstract",
  "visualElements": ["elemento1", "elemento2", "elemento3"],
  "photographyStyle": "Estilo específico de fotografia/videografia",
  "promptTemplate": "Template base com placeholders {element}"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  /**
   * Gera prompt específico para IMAGEM
   */
  async generatePromptForPost(
    visualStrategy: VisualPromptResult,
    postType: 'educational' | 'viral' | 'sales',
    context: BusinessContext
  ): Promise<string> {
    const prompt = `Cria um prompt de IMAGEM ULTRA-REALISTA para este post:

CONTEXTO DO NEGÓCIO:
${context.businessDescription}

ESTRATÉGIA VISUAL:
- Categoria: ${visualStrategy.category}
- Elementos principais: ${visualStrategy.visualElements.join(', ')}
- Estilo fotográfico: ${visualStrategy.photographyStyle}

TIPO DE POST: ${postType}
- Educational: Mostrar produto/serviço em uso, demonstração, detalhes
- Viral: Situação relatable, momento real, emoção autêntica  
- Sales: Apresentação premium do produto/serviço, aspiracional

REQUISITOS TÉCNICOS OBRIGATÓRIOS:
✓ Fotografia profissional real (NUNCA ilustração ou render)
✓ Iluminação natural ou studio profissional
✓ Shot com câmera real (mencionar modelo se relevante)
✓ Composição comercial de alta qualidade
✓ Cores vibrantes mas naturais
✓ Detalhes nítidos (sharp focus, high detail)

FÓRMULA DO PROMPT:
[Elemento principal] + [Ação/contexto] + [Ambiente] + [Técnica fotográfica] + [Qualidade]

EXEMPLOS PERFEITOS:
❌ MAU: "professional person in office with laptop"
✅ BOM: "Close-up of hands writing with luxury fountain pen on premium leather notebook, warm natural window light, shot on Sony A7III 85mm f/1.4, shallow depth of field, professional product photography, ultra sharp focus, commercial quality"

❌ MAU: "gym equipment and people"  
✅ BOM: "Athletic woman performing deadlift with perfect form in modern gym, dramatic side lighting highlighting muscle definition, shot on Canon R5 24-70mm, motion captured mid-lift, professional fitness photography, high detail, aspirational lifestyle"

Cria agora o prompt ESPECÍFICO para ${postType} post (IMAGEM ESTÁTICA):`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * 🆕 Gera prompt específico para VÍDEO/REEL
   */
  async generateVideoPrompt(
    visualStrategy: VisualPromptResult,
    context: BusinessContext
  ): Promise<string> {
    const prompt = `Cria um prompt de VÍDEO ULTRA-REALISTA para um Reel do Instagram:

CONTEXTO DO NEGÓCIO:
${context.businessDescription}

ESTRATÉGIA VISUAL:
- Categoria: ${visualStrategy.category}
- Elementos principais: ${visualStrategy.visualElements.join(', ')}
- Estilo: ${visualStrategy.photographyStyle}

REQUISITOS PARA VÍDEO:
✓ Vídeo vertical 9:16 (formato Reels)
✓ 10-15 segundos de duração
✓ Movimento natural e fluído
✓ Foco no produto/serviço em AÇÃO
✓ Câmera em movimento (tracking, pan, tilt)
✓ Iluminação profissional
✓ Qualidade cinematográfica
✓ NUNCA estático - sempre com ação/movimento

FÓRMULA DO PROMPT DE VÍDEO:
[Ação principal com movimento] + [Câmera em movimento] + [Ambiente] + [Iluminação] + [Formato vertical] + [Qualidade cinematográfica]

EXEMPLOS DE BONS PROMPTS DE VÍDEO:
❌ MAU: "person working on laptop"
✅ BOM: "Close-up tracking shot following hands typing on modern MacBook Pro, camera slowly pans across desk revealing design mockups on screen, natural window light from right side, smooth cinematic movement, professional home office, 9:16 vertical format, commercial quality videography"

❌ MAU: "fitness training video"
✅ BOM: "Dynamic vertical shot tracking athletic person performing burpees in modern gym, camera follows movement from floor to standing, sweat and effort visible, dramatic side lighting highlighting muscle definition, motivational high energy, smooth gimbal movement, 9:16 format for social media, professional fitness videography"

❌ MAU: "baker making bread"
✅ BOM: "Cinematic vertical time-lapse of artisan bread dough rising in bowl, camera slowly orbits around dough, warm bakery lighting, steam and flour particles visible in air, hands kneading dough in background, 9:16 vertical format, professional food videography, aspirational craftsmanship"

❌ MAU: "coffee being made"
✅ BOM: "Slow-motion vertical shot of espresso pouring into glass cup, camera tracking downward following liquid flow, steam rising dramatically, warm golden hour lighting through cafe window, rich brown tones, 9:16 format, commercial beverage videography, ultra detailed"

IMPORTANTE:
- SEMPRE inclui movimento de câmera (tracking, pan, orbit, tilt, etc)
- SEMPRE descreve ação/movimento do sujeito
- SEMPRE menciona iluminação específica
- SEMPRE inclui "9:16 vertical format"
- SEMPRE adiciona detalhes cinematográficos

Cria agora o prompt ESPECÍFICO para vídeo de VENDAS/SALES (mostra o produto/serviço em ação):`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * 🆕 Gera os 3 prompts de IMAGEM + 1 prompt de VÍDEO
   */
  async generateInitialPostPrompts(context: BusinessContext): Promise<{
    educational: string;
    viral: string;
    sales: string;
    salesVideo: string;
  }> {
    console.log('🎨 Visual Prompt Agent a analisar negócio...');
    
    // 1. Analisar estratégia visual do negócio
    const visualStrategy = await this.analyzeBusinessVisuals(context);
    
    console.log(`📸 Categoria visual identificada: ${visualStrategy.category}`);
    console.log(`🎯 Elementos principais: ${visualStrategy.visualElements.join(', ')}`);

    // 2. Gerar prompts de IMAGEM (educational, viral, sales)
    const [educational, viral, sales] = await Promise.all([
      this.generatePromptForPost(visualStrategy, 'educational', context),
      this.generatePromptForPost(visualStrategy, 'viral', context),
      this.generatePromptForPost(visualStrategy, 'sales', context),
    ]);

    // 🆕 3. Gerar prompt de VÍDEO específico
    console.log('🎬 A gerar prompt de vídeo profissional...');
    const salesVideo = await this.generateVideoPrompt(visualStrategy, context);

    console.log('✅ Prompts visuais profissionais gerados!');
    console.log('📸 3 prompts de imagem + 1 prompt de vídeo');

    return { 
      educational, 
      viral, 
      sales,
      salesVideo, // 🆕 PROMPT ESPECÍFICO PARA VÍDEO
    };
  }

  /**
   * Enhance prompt com técnicas avançadas de realismo
   */
  enhanceForRealism(basePrompt: string, style: 'realistic' | 'vibrant' | 'professional'): string {
    // 🔥 IMPERFEIÇÕES NATURAIS (chave do fotorealismo)
    const naturalImperfections = [
      'subtle film grain',
      'natural skin texture with pores',
      'slight lens imperfections',
      'organic lighting variations',
      'natural shadows with soft edges',
      'authentic color temperature shifts',
      'minor focus inconsistencies',
      'real-world dust particles in light',
      'natural wear on surfaces',
      'lived-in environment details',
      'candid unposed moment',
      'documentary photography style',
      'raw unedited photograph',
      'authentic street photography',
      'real camera sensor noise pattern'
    ];

    // Detalhes técnicos profissionais
    const technicalDetails = [
      'shot on Canon EOS R5 with RF 50mm f/1.2',
      'ISO 400 for natural grain',
      'aperture f/2.8 for authentic depth of field',
      '1/250 shutter speed',
      'natural color grading',
      'RAW photography format',
      'unprocessed sensor data',
      'natural dynamic range',
      'real lens characteristics',
      'optical imperfections visible'
    ];

    // 🚫 NEGATIVE PROMPTS ULTRA-AGRESSIVOS
    const negativePrompts = [
      'NO AI generated look',
      'NO digital art',
      'NO 3D render',
      'NO CGI',
      'NO illustration',
      'NO cartoon',
      'NO perfect symmetry',
      'NO flawless skin',
      'NO plastic texture',
      'NO airbrushed',
      'NO overly smooth',
      'NO artificial lighting',
      'NO studio perfect',
      'NO synthetic',
      'NO computer generated',
      'NO fake shadows',
      'NO unrealistic highlights',
      'NO glossy surfaces',
      'NO sterile environment',
      'NO obviously edited',
      'NO photoshop effects',
      'NO beauty filter',
      'NO HDR overprocessing',
      'NO artificial bokeh',
      'NO fake lens flare'
    ];

    // Contexto estilístico
    const styleContext = {
      realistic: [
        'authentic photojournalism',
        'real documentary moment',
        'street photography aesthetic',
        'natural environmental portrait',
        'unscripted genuine expression'
      ],
      vibrant: [
        'real magazine editorial',
        'authentic fashion photography',
        'natural vibrant colors',
        'organic bold composition',
        'genuine lifestyle moment'
      ],
      professional: [
        'corporate photography with natural setting',
        'authentic business environment',
        'real office lifestyle',
        'professional but candid',
        'natural corporate portrait'
      ],
    };

    // Selecionar elementos (mais variação = mais realismo)
    const selectedImperfections = this.selectRandom(naturalImperfections, 5);
    const selectedTechnical = this.selectRandom(technicalDetails, 3);
    const selectedStyle = this.selectRandom(styleContext[style], 2);

    // 🔥 CONSTRUIR PROMPT FINAL ULTRA-REALISTA
    const enhancedPrompt = [
      basePrompt,
      ...selectedImperfections,
      ...selectedTechnical,
      ...selectedStyle,
      'real photograph taken with professional camera',
      'authentic moment captured in real time',
      'zero post-processing',
      'natural unedited reality'
    ].join(', ');

    // Adicionar negative prompts
    const negativeString = `AVOID: ${negativePrompts.join(', ')}`;

    return `${enhancedPrompt}. ${negativeString}`;
  }

  /**
   * Helper para selecionar elementos aleatórios
   */
  private selectRandom(array: string[], count: number): string[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

export const visualPromptAgent = new VisualPromptAgent();