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
Analisas negócios e crias prompts de imagem ULTRA-PROFISSIONAIS e REALISTAS.
Pensas como um diretor de fotografia comercial com 15+ anos de experiência.

REGRAS CRÍTICAS:
1. SEMPRE identifica os elementos visuais principais do negócio
2. NUNCA uses conceitos genéricos ou abstratos
3. Foca em fotografia comercial de alta qualidade
4. Prioriza realismo absoluto (não ilustrações)
5. Inclui detalhes técnicos de fotografia profissional`;

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
2. 5-8 elementos visuais específicos que DEVEM aparecer nas fotos
3. Estilo de fotografia ideal (product photography, lifestyle, portrait, architectural, etc)
4. Template de prompt base para este negócio

EXEMPLOS:
- Canetas → categoria: product, elementos: [canetas, escrita, papel, mãos, documentos], estilo: product photography macro
- Ginásio → categoria: location, elementos: [equipamento, pessoas a treinar, espaço, movimento], estilo: lifestyle fitness photography
- Coach → categoria: person, elementos: [pessoa profissional, ambiente inspirador, gestos, expressões], estilo: professional portrait

Retorna JSON:
{
  "category": "product|service|lifestyle|person|location|abstract",
  "visualElements": ["elemento1", "elemento2", "elemento3"],
  "photographyStyle": "Estilo específico de fotografia",
  "promptTemplate": "Template base com placeholders {element}"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // Baixo para consistência
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  /**
   * Gera prompt específico para um tipo de post
   */
  async generatePromptForPost(
    visualStrategy: VisualPromptResult,
    postType: 'educational' | 'viral' | 'sales',
    context: BusinessContext
  ): Promise<string> {
    const prompt = `Cria um prompt de imagem ULTRA-REALISTA para este post:

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

Cria agora o prompt ESPECÍFICO para ${postType} post:`;

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
   * Gera os 3 prompts para os posts iniciais
   */
  async generateInitialPostPrompts(context: BusinessContext): Promise<{
    educational: string;
    viral: string;
    sales: string;
  }> {
    console.log('🎨 Visual Prompt Agent a analisar negócio...');
    
    // 1. Analisar estratégia visual do negócio
    const visualStrategy = await this.analyzeBusinessVisuals(context);
    
    console.log(`📸 Categoria visual identificada: ${visualStrategy.category}`);
    console.log(`🎯 Elementos principais: ${visualStrategy.visualElements.join(', ')}`);

    // 2. Gerar prompt específico para cada tipo de post
    const [educational, viral, sales] = await Promise.all([
      this.generatePromptForPost(visualStrategy, 'educational', context),
      this.generatePromptForPost(visualStrategy, 'viral', context),
      this.generatePromptForPost(visualStrategy, 'sales', context),
    ]);

    console.log('✅ Prompts visuais profissionais gerados!');

    return { educational, viral, sales };
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