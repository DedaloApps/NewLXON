// src/services/ai/multi-agent-system.ts
import OpenAI from 'openai';
import { imageGenerationService } from '@/services/media/image-generation.service';
import { imageStorageService } from '@/services/media/image-storage.service';
import { heygenVideoService } from '@/services/media/heygen-video.service';

// Import condicional do video service antigo para evitar erros se não existir
let videoGenerationService: any;
try {
  videoGenerationService = require('@/services/media/video-generation.service').videoGenerationService;
} catch (e) {
  console.warn('Video generation service não encontrado');
  videoGenerationService = null;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OnboardingData {
  niche: string;
  objective: string;
  platforms: string[];
  tone: string;
  autoPosting: string;
  audience?: string;
  audienceDetails?: any;
}

interface AgentResponse<T> {
  agent: string;
  result: T;
  tokensUsed: number;
  timestamp: Date;
}

// ==========================
// 1. STRATEGY AGENT
// ==========================
class StrategyAgent {
  private systemPrompt = `Tu és o Strategy Agent, especialista em criar estratégias de marketing de conteúdo. 
A tua única função é analisar o perfil do utilizador e criar uma estratégia completa e personalizada.
Pensas como um estratega de marketing sénior com 10+ anos de experiência.`;

  async createStrategy(data: OnboardingData): Promise<AgentResponse<any>> {
    const prompt = `Cria uma estratégia de conteúdo completa para:
    
Negócio: ${data.niche}
Público-alvo: ${data.audience || 'Não especificado'}
${data.audienceDetails ? `Detalhes: ${JSON.stringify(data.audienceDetails)}` : ''}
Objetivo: ${data.objective}
Plataformas: ${data.platforms.join(', ')}
Tom de voz: ${data.tone}
Modo de publicação: ${data.autoPosting}

Retorna JSON com:
{
  "contentPillars": [
    {
      "name": "Nome do pilar",
      "description": "O que publicar",
      "percentage": 30,
      "examples": ["exemplo 1", "exemplo 2"]
    }
  ],
  "formatMix": {
    "carousels": 40,
    "reels": 30,
    "single": 20,
    "stories": 10
  },
  "postingSchedule": {
    "bestDays": ["monday", "wednesday", "friday"],
    "bestTimes": ["09:00", "13:00", "19:00"],
    "reasoning": "Porquê estes horários"
  },
  "hashtagStrategy": {
    "high": ["#hashtag1", "#hashtag2"],
    "medium": ["#hashtag3", "#hashtag4"],
    "niche": ["#hashtag5", "#hashtag6"]
  },
  "keyMetrics": ["métrica1", "métrica2", "métrica3"],
  "monthlyGoals": {
    "followers": 500,
    "engagement": 4.5,
    "reach": 10000
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return {
      agent: 'StrategyAgent',
      result: JSON.parse(completion.choices[0].message.content || '{}'),
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }
}

// ==========================
// 2. CONTENT AGENT (ATUALIZADO: 2 IMAGENS + 1 REEL)
// ==========================
class ContentAgent {
  private systemPrompt = `Tu és o Content Agent, mestre em criar conteúdo viral e envolvente.
Especializas-te em escrever captions que geram engagement, usando storytelling e psicologia.
Nunca crias conteúdo genérico - tudo é personalizado e estratégico.

IMPORTANTE - LÍNGUA PORTUGUESA DE PORTUGAL:
- SEMPRE usa "tu", "teu", "contigo" (NUNCA "você", "seu", "consigo")
- Usa expressões portuguesas: "fixe", "espetacular", "brutal", "top"
- Evita brasileirismos: NUNCA uses "você", "legal", "bacana", "cara"
- Tom informal português: "Olá!", "Vamos lá", "Atenção", "Experimenta"
- Exemplos CORRETOS PT-PT:
  ✅ "Queres saber como...?" (não "Você quer saber")
  ✅ "Isto é para ti" (não "Isso é para você")
  ✅ "O teu negócio" (não "O seu negócio")
  ✅ "Vê isto" (não "Veja isso")
  ✅ "Partilha nos comentários" (não "Compartilhe nos comentários")

CRÍTICO PARA IMAGENS - PARECER FOTOS REAIS, NÃO IA:
Quando crias imagePrompts, descreves como se fosses um fotógrafo a tirar uma foto REAL com smartphone:

✅ SEMPRE incluir:
- "Real person" ou "Authentic moment"
- "Shot on iPhone" ou "smartphone photography"
- "Natural lighting" ou "window light"
- Ambiente específico e realista (gym real, café real, escritório real)
- "Candid photo" ou "lifestyle photography"
- Imperfeições naturais: "natural skin texture", "casual pose"

❌ NUNCA mencionar:
- "Perfect", "flawless", "ideal", "model-like"
- "Studio lighting", "professional setup"
- "Illustration", "design", "graphic", "render"
- "Dramatic lighting", "cinematic"
- "Beauty filter", "airbrushed"

EXEMPLOS CORRETOS (parecem fotos reais):
✅ "Real Portuguese personal trainer in authentic gym, shot on iPhone 15, natural overhead lighting, casual workout clothes, candid moment during training session, natural skin texture, relaxed expression, real fitness environment with equipment in background"
✅ "Authentic lifestyle photo of real person working on laptop in modern Lisbon cafe, smartphone photography, natural window light, everyday clothes, genuine concentration, slightly grainy, unposed moment, real coffee cup on table"
✅ "Real entrepreneur in casual home office, shot with phone camera, natural daylight from window, wearing comfortable clothing, authentic workspace with slight mess, candid expression, real life setting"

EXEMPLOS ERRADOS (parecem IA):
❌ "Perfect model in professional gym studio with dramatic lighting"
❌ "Flawless fitness professional in ideal setting"
❌ "Beautiful illustration of trainer with perfect posture"`;

  async generateInitialPosts(
    data: OnboardingData,
    strategy: any
  ): Promise<AgentResponse<any>> {
    const prompt = `Cria 3 posts iniciais COMPLETOS para começar:

Contexto:
- Nicho: ${data.niche}
- Objetivo: ${data.objective}
- Tom: ${data.tone}
- Plataforma principal: ${data.platforms[0]}
- Pilares de conteúdo: ${strategy.contentPillars.map((p: any) => p.name).join(', ')}

⚠️ CRÍTICO - PORTUGUÊS DE PORTUGAL (PT-PT):
TODAS as captions, hooks e CTAs DEVEM ser em PORTUGUÊS DE PORTUGAL:
- Usa "tu", "teu", "contigo" (NUNCA "você", "seu")
- Usa "partilhar" (não "compartilhar")
- Usa "telemóvel" (não "celular")
- Usa "fixe", "brutal", "espetacular" (não "legal", "bacana")
- Tom direto e informal português: "Olá!", "Vê isto", "Experimenta", "Atenção"

EXEMPLOS DE TEXTO PT-PT:
✅ "Queres saber o segredo? Vê aqui 👇"
✅ "Isto mudou completamente o meu negócio"
✅ "3 erros que TODOS cometem (e tu provavelmente também)"
✅ "Partilha isto com alguém que precisa"
✅ "Deixa um ❤️ se concordas"

❌ NUNCA:
"Você quer saber?" 
"Isso mudou..."
"Compartilhe com alguém"
"Deixe um comentário"

IMPORTANTE: Cria EXATAMENTE nesta ordem:
1. POST COM IMAGEM (educativo - ensina algo valioso)
2. POST COM IMAGEM (viral - entretenimento/relatable)
3. REEL COM VÍDEO (vendas/CTA - converte)

SUPER CRÍTICO - IMAGENS DEVEM PARECER FOTOS REAIS, NÃO IA:

Para cada imagePrompt (posts 1 e 2), segue esta FÓRMULA EXATA:

"Real [pessoa portuguesa relevante ao nicho] in [local específico real], shot on iPhone 15, natural [tipo de luz], wearing [roupa casual real], [ação natural/candid], natural skin texture, relaxed/genuine expression, slightly grainy, unposed moment, real [ambiente] with [detalhes reais]"

EXEMPLOS PERFEITOS por nicho:

FITNESS/TREINO:
✅ "Real Portuguese fitness enthusiast in authentic local gym, shot on iPhone 15, natural overhead gym lighting, wearing everyday workout clothes, candid moment mid-exercise, natural skin texture with slight sweat, relaxed concentration, slightly grainy, unposed training moment, real gym environment with equipment and mirrors"

NEGÓCIOS/EMPREENDEDORISMO:
✅ "Real Portuguese entrepreneur working on laptop in casual Lisbon cafe, shot on iPhone 15 Pro, natural window daylight, wearing comfortable everyday clothes, genuine concentration on screen, natural skin texture, candid working moment, slightly grainy, real coffee shop atmosphere with people in soft background"

BELEZA/ESTÉTICA:
✅ "Real person applying skincare in authentic bathroom, shot with smartphone camera, natural bathroom lighting, wearing casual home clothes, candid self-care moment, natural skin texture visible, relaxed expression, everyday setting, real bathroom counter with products"

COMIDA/RESTAURANTE:
✅ "Real Portuguese chef cooking in authentic kitchen, shot on iPhone, natural kitchen lighting, wearing comfortable chef attire, candid moment while preparing food, natural expression, slightly grainy, real restaurant kitchen with cooking equipment and ingredients"

CONSULTOR/COACH:
✅ "Real professional during casual consulting session in authentic office space, shot on smartphone, natural daylight from windows, business casual attire, genuine interaction moment, natural skin texture, relaxed professional demeanor, slightly grainy, real office with desk and materials"

❌ O QUE NUNCA FAZER:
- "Perfect model with flawless skin"
- "Professional photography with studio lighting"
- "Cinematic portrait with dramatic background"
- "Beautiful illustration of ideal scenario"

Para o REEL (post 3), cria um script de 30-45 segundos para talking head EM PT-PT.

Formato JSON:
{
  "posts": [
    {
      "type": "educational",
      "mediaType": "image",
      "hook": "Frase de abertura impactante EM PT-PT (usa TU, não VOCÊ)",
      "caption": "Caption completa com storytelling EM PT-PT (TU, TEU, CONTIGO)",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "cta": "Call to action EM PT-PT (Partilha, Comenta, Deixa)",
      "imagePrompt": "PROMPT SEGUINDO FÓRMULA ACIMA - FOTO REAL COM IPHONE",
      "estimatedEngagement": "alto/médio/baixo",
      "bestTimeToPost": "09:00"
    },
    {
      "type": "viral",
      "mediaType": "image",
      "hook": "Hook viral e relatable EM PT-PT",
      "caption": "Caption com storytelling emocional EM PT-PT",
      "hashtags": ["#tag1", "#tag2"],
      "cta": "Comentário ou partilha EM PT-PT",
      "imagePrompt": "PROMPT SEGUINDO FÓRMULA ACIMA - MOMENTO AUTÊNTICO",
      "estimatedEngagement": "alto",
      "bestTimeToPost": "13:00"
    },
    {
      "type": "sales",
      "mediaType": "reel",
      "hook": "Hook poderoso para vídeo EM PT-PT",
      "caption": "Caption que converte EM PT-PT",
      "hashtags": ["#reels", "#tag2"],
      "cta": "Link na bio / Envia DM (EM PT-PT)",
      "videoScript": "Script de 30-45s EM PT-PT: [Intro 5s] → [Problema 10s] → [Solução 15s] → [CTA 10s]",
      "imagePrompt": "Thumbnail: Real Portuguese person in [contexto], shot on iPhone, natural lighting, casual authentic moment",
      "estimatedEngagement": "muito alto",
      "bestTimeToPost": "19:00"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    return {
      agent: 'ContentAgent',
      result: JSON.parse(completion.choices[0].message.content || '{}'),
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }

  async generateContentIdeas(
    data: OnboardingData,
    count: number = 10
  ): Promise<AgentResponse<any>> {
    const prompt = `Gera ${count} ideias de conteúdo específicas para:
    
Nicho: ${data.niche}
Objetivo: ${data.objective}
Tom: ${data.tone}

⚠️ IMPORTANTE: Todas as ideias em PORTUGUÊS DE PORTUGAL (PT-PT)
- Usa "tu", "teu" (nunca "você", "seu")
- Tom informal português

Cada ideia deve ter:
- Título/Hook cativante EM PT-PT
- Tipo (carrossel/reel/post)
- Valor que entrega
- Dificuldade de criar (fácil/média/difícil)

JSON:
{
  "ideas": [
    {
      "title": "Como fazer X em 5 passos (EM PT-PT)",
      "type": "carousel",
      "value": "Ensina processo completo",
      "difficulty": "easy",
      "estimatedTime": "10min"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    });

    return {
      agent: 'ContentAgent',
      result: JSON.parse(completion.choices[0].message.content || '{}'),
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }
}

// ==========================
// 3. ANALYSIS AGENT
// ==========================
class AnalysisAgent {
  private systemPrompt = `Tu és o Analysis Agent, expert em análise de dados e otimização.
Identificas padrões, oportunidades e dás recomendações baseadas em dados.
Pensas como um data scientist focado em growth.`;

  async analyzePerfectProfile(data: OnboardingData): Promise<AgentResponse<any>> {
    const prompt = `Analisa o perfil ideal para alguém em:

Nicho: ${data.niche}
Plataformas: ${data.platforms.join(', ')}
Objetivo: ${data.objective}

Retorna análise completa em formato JSON:
{
  "profileOptimization": {
    "bioSuggestion": "Bio optimizada com emoji e CTA",
    "profilePicture": "Descrição do que deve ter",
    "highlightCovers": ["Tema 1", "Tema 2", "Tema 3"],
    "linkInBio": "O que colocar no link"
  },
  "contentAesthetic": {
    "colorPalette": ["#hex1", "#hex2", "#hex3"],
    "visualStyle": "Descrição do estilo visual",
    "fontStyle": "clean/bold/playful"
  },
  "competitorInsights": {
    "whatWorksInNiche": ["insight 1", "insight 2"],
    "gapsToExploit": ["oportunidade 1", "oportunidade 2"],
    "avoidMistakes": ["erro comum 1", "erro comum 2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    return {
      agent: 'AnalysisAgent',
      result: JSON.parse(completion.choices[0].message.content || '{}'),
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }
}

// ==========================
// 4. SCHEDULING AGENT
// ==========================
class SchedulingAgent {
  private systemPrompt = `Tu és o Scheduling Agent, especialista em timing e calendários de conteúdo.
Optimizas quando publicar baseado em audiência, algoritmo e comportamento.`;

  async createWeeklyCalendar(
    data: OnboardingData,
    strategy: any,
    contentIdeas: any
  ): Promise<AgentResponse<any>> {
    const frequencyMap: any = {
      full_auto: 7,
      semi_auto: 5,
      creative_assist: 3,
      strategy_only: 0,
    };
    const postsPerWeek = frequencyMap[data.autoPosting] || 3;

    const prompt = `Cria um calendário semanal detalhado em formato JSON:

Frequência: ${postsPerWeek} posts/semana
Modo: ${data.autoPosting}
Plataformas: ${data.platforms.join(', ')}
Melhores horários: ${strategy.postingSchedule.bestTimes.join(', ')}
Ideias disponíveis: ${contentIdeas.ideas.length}

Distribui os posts pela semana de forma estratégica.

JSON:
{
  "weeklyCalendar": [
    {
      "day": "monday",
      "date": "2024-01-15",
      "posts": [
        {
          "time": "09:00",
          "platform": "instagram",
          "contentType": "carousel",
          "topic": "Título do post",
          "pillar": "Nome do pilar",
          "priority": "high"
        }
      ]
    }
  ],
  "weeklyGoals": {
    "totalPosts": 5,
    "estimatedReach": 5000,
    "focusMetric": "engagement"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    return {
      agent: 'SchedulingAgent',
      result: JSON.parse(completion.choices[0].message.content || '{}'),
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }
}

// ==========================
// 5. VISUAL AGENT (ATUALIZADO: SUPORTE A IMAGENS + VÍDEOS)
// ==========================
class VisualAgent {
  private systemPrompt = `Tu és o Visual Agent, especialista em criar estratégias visuais profissionais.
És expert em:
- Criar prompts detalhados para geração de imagens por IA
- Garantir consistência visual da marca
- Otimizar imagens para engajamento em redes sociais
- Criar texto legível e impactante em imagens
- Escolher o estilo visual ideal para cada tipo de conteúdo
- Garantir persistência permanente das imagens geradas
- Gerar vídeos com HeyGen para reels

Pensas como um diretor de arte com 10+ anos de experiência em social media.`;

  /**
   * Gera IMAGENS + VÍDEOS para os posts (2 fotos + 1 reel)
   */
  async generateMediaForPosts(
    posts: any[],
    userId: string,
    businessContext: {
      niche: string;
      audience?: string;
      tone: string;
    }
  ): Promise<AgentResponse<any>> {
    console.log(`🎨 Visual Agent a gerar media para ${posts.length} posts...`);
    console.log('📋 Mix: 2 Imagens + 1 Reel (vídeo HeyGen)');
    
    // ✅ Garantir que o bucket existe
    await imageStorageService.ensureBucketExists();
    console.log('✅ Storage configurado e pronto');
    
    const mediaGenerated = [];
    let totalTokens = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      try {
        console.log(`\n🎬 Gerando media ${i + 1}/${posts.length}: ${post.mediaType || 'image'}`);

        if (post.mediaType === 'reel' || post.type === 'sales') {
          // POST 3: GERAR VÍDEO COM HEYGEN 🎥
          console.log('🎥 Gerando REEL com HeyGen...');
          
          const video = await heygenVideoService.generateVideoWithAvatar({
            script: post.videoScript || post.caption,
            aspectRatio: '9:16',
            background: '#FFFFFF',
          });

          // TODO: Guardar vídeo também (opcional, HeyGen já hospeda)
          
          mediaGenerated.push({
            postType: post.type,
            mediaType: 'video',
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            videoScript: post.videoScript,
            hasText: false,
          });

          console.log(`✅ Reel gerado: ${video.videoUrl}`);
        } else {
          // POSTS 1 e 2: GERAR IMAGENS 📸
          console.log('🖼️ Gerando IMAGEM...');
          
          const shouldIncludeText = this.shouldIncludeTextInImage(post.type);
          
          // Gerar imagem temporária
          const temporaryUrl = await imageGenerationService.generateImage({
            prompt: post.imagePrompt,
            style: this.selectStyleForPost(post.type, businessContext.tone),
            aspectRatio: '1:1',
          });

          console.log(`📥 Imagem temporária gerada, a guardar permanentemente...`);

          // Guardar permanentemente
          const saved = await imageStorageService.saveImagePermanently(
            temporaryUrl,
            userId,
            `post-${post.type}-${i + 1}`
          );

          console.log(`✅ Imagem ${i + 1} guardada: ${saved.publicUrl}`);

          mediaGenerated.push({
            postType: post.type,
            mediaType: 'image',
            imageUrl: saved.publicUrl,
            temporaryImageUrl: temporaryUrl,
            imagePath: saved.path,
            imagePrompt: post.imagePrompt,
            hasText: shouldIncludeText,
            storageBucket: saved.bucket,
          });
        }
        
        // Delay para evitar rate limits
        if (i < posts.length - 1) {
          console.log('⏳ Aguardando 3s...');
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar media para post ${post.type}:`, error);
        
        // Fallback
        if (post.mediaType === 'reel' || post.type === 'sales') {
          mediaGenerated.push({
            postType: post.type,
            mediaType: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl: 'https://via.placeholder.com/1080x1920',
            duration: 30,
            error: true,
          });
        } else {
          mediaGenerated.push({
            postType: post.type,
            mediaType: 'image',
            imageUrl: `https://via.placeholder.com/1080x1080/3B82F6/FFFFFF?text=${post.type}`,
            imagePrompt: post.imagePrompt,
            hasText: false,
            error: true,
          });
        }
      }
    }

    console.log(`✅ Visual Agent: ${mediaGenerated.length} media gerados!`);
    console.log(`📸 Imagens: ${mediaGenerated.filter(m => m.mediaType === 'image').length}`);
    console.log(`🎬 Vídeos: ${mediaGenerated.filter(m => m.mediaType === 'video').length}`);

    return {
      agent: 'VisualAgent',
      result: {
        media: mediaGenerated,
        visualStrategy: await this.createVisualStrategy(businessContext),
        storageInfo: {
          bucket: 'content-images',
          totalMedia: mediaGenerated.length,
          successfulUploads: mediaGenerated.filter(m => !m.error).length,
        },
      },
      tokensUsed: totalTokens,
      timestamp: new Date(),
    };
  }

  // TODOS OS MÉTODOS PRIVADOS DO TEU CÓDIGO ORIGINAL
  private async createVisualStrategy(businessContext: any): Promise<any> {
    const prompt = `Cria uma estratégia visual completa para:

Negócio: ${businessContext.niche}
Público: ${businessContext.audience || 'Geral'}
Tom: ${businessContext.tone}

Retorna estratégia em JSON:
{
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "reasoning": "Porquê estas cores"
  },
  "visualStyle": {
    "overall": "minimalist/vibrant/professional/authentic",
    "photography": "descrição do estilo fotográfico",
    "typography": "clean/bold/elegant",
    "filters": "sugestões de filtros"
  },
  "contentGuidelines": {
    "do": ["diretriz 1", "diretriz 2"],
    "dont": ["evitar 1", "evitar 2"]
  },
  "templateSuggestions": [
    {
      "type": "carousel_education",
      "layout": "descrição do layout",
      "useCase": "quando usar"
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Erro ao criar estratégia visual:', error);
      return this.getDefaultVisualStrategy();
    }
  }

  private shouldIncludeTextInImage(postType: string): boolean {
    const typesWithText = ['educational', 'announcement', 'promotional', 'tip'];
    return typesWithText.includes(postType.toLowerCase());
  }

  private extractBusinessType(niche: string): string {
    const businessTypes: Record<string, string[]> = {
      fitness: ['fitness', 'gym', 'workout', 'personal trainer', 'yoga'],
      food: ['restaurant', 'food', 'chef', 'catering', 'bakery'],
      fashion: ['fashion', 'clothing', 'boutique', 'style', 'designer'],
      beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'salon'],
      tech: ['tech', 'software', 'app', 'saas', 'startup'],
      coaching: ['coach', 'consulting', 'mentor', 'advisor'],
    };

    const nicheLower = niche.toLowerCase();
    for (const [type, keywords] of Object.entries(businessTypes)) {
      if (keywords.some((keyword) => nicheLower.includes(keyword))) {
        return type;
      }
    }

    return 'professional';
  }

  private mapPostTypeToGoal(postType: string): string {
    const goalMap: Record<string, string> = {
      educational: 'educação',
      viral: 'engagement',
      sales: 'conversão',
      promotional: 'conversão',
      behind_scenes: 'autenticidade',
      testimonial: 'prova social',
    };

    return goalMap[postType.toLowerCase()] || 'engagement';
  }

  private selectStyleForPost(postType: string, tone: string): 'professional' | 'vibrant' | 'minimalist' | 'realistic' | 'illustration' {
    // Mapeia tons para estilos válidos do ImageGenerationService
    const toneStyleMap: Record<string, 'professional' | 'vibrant' | 'minimalist' | 'realistic' | 'illustration'> = {
      professional: 'professional',
      casual: 'realistic',        // authentic → realistic
      energetic: 'vibrant',
      elegant: 'professional',    // luxury → professional
      minimal: 'minimalist',
      bold: 'vibrant',
      authentic: 'realistic',
      luxury: 'professional',
    };

    const baseStyle = toneStyleMap[tone.toLowerCase()] || 'professional';

    // Prioridade por tipo de post
    if (postType === 'viral' || postType === 'entertainment') {
      return 'vibrant';
    }
    if (postType === 'sales' || postType === 'promotional') {
      return 'professional';
    }
    if (postType === 'educational') {
      return 'realistic';  // Educativo = fotos realistas
    }

    return baseStyle;
  }

  private extractMainText(text: string): string {
    const words = text.split(' ').slice(0, 3).join(' ');
    return words.length > 25 ? words.substring(0, 22) + '...' : words;
  }

  private getDefaultVisualStrategy(): any {
    return {
      colorPalette: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#F59E0B',
        reasoning: 'Cores vibrantes e modernas para social media',
      },
      visualStyle: {
        overall: 'professional',
        photography: 'Clean, well-lit, modern aesthetic',
        typography: 'Bold and readable',
        filters: 'Subtle brightness and contrast enhancement',
      },
      contentGuidelines: {
        do: ['Use high-quality images', 'Maintain brand colors', 'Keep text minimal'],
        dont: ['Use low-resolution images', 'Overcrowd with text', 'Use inconsistent styles'],
      },
      templateSuggestions: [],
    };
  }
}

// ==========================
// ORCHESTRATOR FINAL
// ==========================
export class AIOrchestrator {
  private strategyAgent: StrategyAgent;
  private contentAgent: ContentAgent;
  private analysisAgent: AnalysisAgent;
  private schedulingAgent: SchedulingAgent;
  private visualAgent: VisualAgent;

  constructor() {
    this.strategyAgent = new StrategyAgent();
    this.contentAgent = new ContentAgent();
    this.analysisAgent = new AnalysisAgent();
    this.schedulingAgent = new SchedulingAgent();
    this.visualAgent = new VisualAgent();
  }

  async processOnboarding(data: OnboardingData, userId: string) {
    console.log('🤖 Multi-Agent System iniciado...');
    console.log('👥 Agentes: Strategy, Content, Visual (2 imgs + 1 vídeo!), Analysis, Scheduling');

    // Fase 1: Strategy Agent
    console.log('📊 Strategy Agent a trabalhar...');
    const strategy = await this.strategyAgent.createStrategy(data);

    // Fase 2: Content Agent (gera 2 posts com imagem + 1 reel)
    console.log('✍️ Content Agent a gerar 3 posts (2 imgs + 1 reel)...');
    const [initialPosts, contentIdeas] = await Promise.all([
      this.contentAgent.generateInitialPosts(data, strategy.result),
      this.contentAgent.generateContentIdeas(data, 10),
    ]);

    // Fase 3: Visual Agent - GERA 2 IMAGENS + 1 VÍDEO HEYGEN! 🎨🎬
    console.log('🎨🎬 Visual Agent a criar 2 imagens + 1 reel...');
    const visualContent = await this.visualAgent.generateMediaForPosts(
      initialPosts.result.posts,
      userId,
      {
        niche: data.niche,
        audience: data.audience,
        tone: data.tone,
      }
    );

    // Combinar posts com media gerada
    const postsWithMedia = initialPosts.result.posts.map((post: any, index: number) => ({
      ...post,
      // Se for vídeo
      ...(visualContent.result.media[index]?.mediaType === 'video' && {
        videoUrl: visualContent.result.media[index]?.videoUrl,
        thumbnailUrl: visualContent.result.media[index]?.thumbnailUrl,
        duration: visualContent.result.media[index]?.duration,
      }),
      // Se for imagem
      ...(visualContent.result.media[index]?.mediaType === 'image' && {
        imageUrl: visualContent.result.media[index]?.imageUrl,
        temporaryImageUrl: visualContent.result.media[index]?.temporaryImageUrl,
        imagePath: visualContent.result.media[index]?.imagePath,
      }),
      // Metadata comum
      mediaType: visualContent.result.media[index]?.mediaType,
      visualMetadata: visualContent.result.media[index],
    }));

    // Fase 4: Analysis Agent
    console.log('🔍 Analysis Agent a analisar...');
    const profileAnalysis = await this.analysisAgent.analyzePerfectProfile(data);

    // Fase 5: Scheduling Agent
    console.log('📅 Scheduling Agent a criar calendário...');
    const calendar = await this.schedulingAgent.createWeeklyCalendar(
      data,
      strategy.result,
      contentIdeas.result
    );

    const totalTokens =
      strategy.tokensUsed +
      initialPosts.tokensUsed +
      visualContent.tokensUsed +
      contentIdeas.tokensUsed +
      profileAnalysis.tokensUsed +
      calendar.tokensUsed;

    console.log('✅ Multi-Agent System concluído!');
    console.log(`💰 Tokens totais: ${totalTokens}`);
    console.log(`📸 2 Imagens geradas e guardadas permanentemente`);
    console.log(`🎬 1 Reel gerado com HeyGen`);

    return {
      strategy: strategy.result,
      initialPosts: postsWithMedia, // ← 2 COM IMAGENS + 1 COM VÍDEO!
      contentIdeas: contentIdeas.result.ideas,
      profileAnalysis: profileAnalysis.result,
      weeklyCalendar: calendar.result,
      visualStrategy: visualContent.result.visualStrategy,
      storageInfo: visualContent.result.storageInfo,
      metadata: {
        totalTokens,
        cost: (totalTokens / 1000) * 0.01,
        processingTime: new Date(),
        agents: [
          strategy.agent,
          initialPosts.agent,
          visualContent.agent,
          contentIdeas.agent,
          profileAnalysis.agent,
          calendar.agent,
        ],
      },
    };
  }
}