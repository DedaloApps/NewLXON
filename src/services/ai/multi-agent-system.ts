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
// 2. CONTENT AGENT PREMIUM 🔥
// ==========================
class ContentAgent {
  private systemPrompt = `Tu és o Content Agent PREMIUM, especialista em copywriting viral para Instagram.

ESPECIALIDADES:
- Hooks que param o scroll em 0.3 segundos
- Storytelling que gera conexão emocional
- CTAs que convertem sem parecer vendas
- Emojis estratégicos (não aleatórios)
- Estrutura AIDA (Atenção, Interesse, Desejo, Ação)

REGRAS DE OURO PARA CAPTIONS:
1. SEMPRE começar com hook impactante (max 10 palavras)
2. Caption entre 125-150 palavras (sweet spot do algoritmo)
3. Mínimo 3 emojis estratégicos por caption
4. CTA claro e específico no final
5. Hashtags: 5 nicho + 3 médio volume + 2 alto volume
6. Evitar clichês ("não percas", "clica no link", "segue-nos")
7. Tom conversacional, como amigo dando conselho

ESTRUTURA OBRIGATÓRIA DA CAPTION:
[EMOJI] HOOK IMPACTANTE (1 linha)
↓
Linha em branco
↓
Storytelling (80-100 palavras)
- Conecta com dor/desejo
- Usa "tu" não "você"
- Frases curtas e diretas
↓
Linha em branco
↓
Value proposition (20-30 palavras)
↓
CTA específico [EMOJI]
↓
Hashtags (10 no total)

EXEMPLOS DE HOOKS FORTES:
❌ "Hoje vou falar sobre..."
✅ "Isto mudou o meu negócio em 7 dias 👇"

❌ "Dica importante para ti"
✅ "Se ainda fazes isto, estás a perder 50% dos clientes 🚨"

❌ "Vou ensinar-te como..."
✅ "O erro que todos cometem (eu incluído) 💔"

IMPORTANTE - PORTUGUÊS DE PORTUGAL:
- SEMPRE usa "tu", "teu", "contigo" (NUNCA "você", "seu", "consigo")
- Usa expressões portuguesas: "fixe", "espetacular", "brutal"
- Tom direto: "Olá!", "Vê isto", "Experimenta", "Atenção"

CRÍTICO PARA IMAGENS - PARECER FOTOS REAIS:
Prompts devem descrever fotos REAIS com smartphone:
✅ "Real person shot on iPhone, natural lighting, candid moment"
❌ "Perfect model, studio lighting, professional photography"`;

  async generateInitialPosts(
    data: OnboardingData,
    strategy: any
  ): Promise<AgentResponse<any>> {
    const prompt = `Cria 3 posts iniciais PREMIUM (nota 9-10) para Instagram:

CONTEXTO:
- Nicho: ${data.niche}
- Objetivo: ${data.objective}
- Tom: ${data.tone}
- Plataforma: ${data.platforms[0]}
- Pilares: ${strategy.contentPillars.map((p: any) => p.name).join(', ')}

POSTS REQUERIDOS (nesta ordem):
1. POST COM IMAGEM - EDUCATIVO (ensina algo valioso)
2. POST COM IMAGEM - VIRAL (entretenimento/relatable)
3. REEL COM VÍDEO - VENDAS/CTA (converte)

REQUISITOS OBRIGATÓRIOS (para nota 10):
✅ Hook que para o scroll
✅ Caption 125-150 palavras COM storytelling
✅ Mínimo 3 emojis estratégicos
✅ CTA claro e específico
✅ 10 hashtags (5 nicho + 3 médio + 2 alto)
✅ Tom conversacional PT-PT
✅ Zero clichês

ESTRUTURA DA CAPTION (OBRIGATÓRIA):
🎯 HOOK impactante (1 linha)

[Linha em branco]

Storytelling emocional de 80-100 palavras que:
- Liga à dor/desejo do público
- Usa "tu", "teu", "contigo"
- Frases curtas e impactantes
- Conta história pessoal ou caso real
- Inclui 2-3 emojis naturais

[Linha em branco]

Value proposition (20-30 palavras):
- O que vão ganhar
- Benefício claro e tangível

[Linha em branco]

💬 CTA específico e acionável
(Ex: "Comenta SIM se queres X" ou "Partilha com quem precisa disto")

FORMATO JSON:
{
  "posts": [
    {
      "type": "educational",
      "mediaType": "image",
      "hook": "Hook impactante max 10 palavras EM PT-PT",
      "caption": "Caption COMPLETA 125-150 palavras seguindo ESTRUTURA OBRIGATÓRIA acima. IMPORTANTE: Deve ser um texto corrido natural, não pode ter marcadores tipo '[Linha em branco]', '[Storytelling]', etc. Apenas o texto final pronto a publicar com quebras de linha reais.",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      "cta": "CTA específico PT-PT",
      "imagePrompt": "Real Portuguese [pessoa do nicho] in authentic [local], shot on iPhone 15, natural lighting, casual clothes, candid moment, natural skin texture, relaxed expression, slightly grainy, unposed, real environment",
      "estimatedEngagement": "alto",
      "bestTimeToPost": "09:00",
      "wordCount": 135,
      "emojiCount": 4,
      "qualityScore": 9.5
    },
    {
      "type": "viral",
      "mediaType": "image",
      "hook": "Hook viral e relatable EM PT-PT",
      "caption": "Caption COMPLETA 125-150 palavras com storytelling emocional. Texto final pronto, sem marcadores.",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      "cta": "CTA para comentário ou partilha PT-PT",
      "imagePrompt": "Real person in [situação relatable], shot on smartphone, natural moment, authentic emotion, candid photography",
      "estimatedEngagement": "muito alto",
      "bestTimeToPost": "13:00",
      "wordCount": 140,
      "emojiCount": 5,
      "qualityScore": 9.5
    },
    {
      "type": "sales",
      "mediaType": "reel",
      "hook": "Hook poderoso para vídeo EM PT-PT",
      "caption": "Caption de CONVERSÃO 125-150 palavras. Storytelling que leva ao CTA forte. Texto final pronto.",
      "hashtags": ["reels", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      "cta": "Link na bio / Envia DM PT-PT",
      "videoScript": "Script detalhado 30-45 segundos EM PT-PT:\n\n[0-5s] INTRO - Hook visual + verbal\n[5-15s] PROBLEMA - Dor que o público sente\n[15-30s] SOLUÇÃO - Como resolver (teu produto/serviço)\n[30-45s] CTA - Ação específica clara\n\nTexto completo do que dizer em cada parte, em PT-PT conversacional.",
      "imagePrompt": "Real Portuguese person in [contexto vendas], shot on iPhone, natural lighting, professional but casual",
      "estimatedEngagement": "muito alto",
      "bestTimeToPost": "19:00",
      "wordCount": 145,
      "emojiCount": 4,
      "qualityScore": 9.5
    }
  ]
}

CRÍTICO: Cada caption DEVE ser texto FINAL pronto a copiar/colar. Não incluir [instruções], [Storytelling], etc. Apenas o texto real com emojis e quebras de linha.

EXEMPLO DE CAPTION BOA:
"🚀 Isto mudou completamente o meu negócio

Há 6 meses estava a trabalhar 12 horas por dia. Acordava às 6h, dormia à meia-noite. Zero resultados.

Até que descobri este sistema. Em 30 dias, dobrei os resultados com metade do esforço. Sim, é possível.

O segredo? Foco nas 3 tarefas certas. Não trabalhar mais, trabalhar melhor.

💬 Comenta FOCO se também queres saber quais são

#empreendedorismo #produtividade #negociosonline #marketingdigital #sucessodigital #trabalhointeligente #focoemresultados #crescimento #estrategia #portugal"

IMPORTANTE: Gera SEMPRE 3 posts completos. Se não gerar os 3, refaz.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
      max_tokens: 4000, // Aumentar para captions longas
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    // 🆕 VALIDAÇÃO E DEBUG
    console.log('📝 CONTENT AGENT - Posts gerados:');
    if (result.posts && Array.isArray(result.posts)) {
      result.posts.forEach((post: any, i: number) => {
        console.log(`\n✅ POST ${i + 1}:`, {
          type: post.type,
          hasCaption: !!post.caption,
          captionLength: post.caption?.length || 0,
          wordCount: post.wordCount,
          emojiCount: post.emojiCount,
          qualityScore: post.qualityScore,
          captionPreview: post.caption?.substring(0, 100) + '...',
        });
      });
    } else {
      console.error('❌ ERRO: Posts não gerados corretamente!');
    }

    return {
      agent: 'ContentAgent',
      result,
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };
  }

  async generateContentIdeas(
    data: OnboardingData,
    count: number = 10
  ): Promise<AgentResponse<any>> {
    const prompt = `Gera ${count} ideias de conteúdo VIRAIS para:
    
Nicho: ${data.niche}
Objetivo: ${data.objective}
Tom: ${data.tone}

⚠️ IMPORTANTE: Todas as ideias em PORTUGUÊS DE PORTUGAL (PT-PT)

Cada ideia PREMIUM deve ter:
- Hook viral (testado no nicho)
- Tipo otimizado (carrossel/reel/post)
- Promise clara de valor
- Dificuldade realista

JSON:
{
  "ideas": [
    {
      "title": "Hook viral específico do nicho EM PT-PT",
      "type": "carousel",
      "value": "Valor específico que entrega",
      "difficulty": "easy",
      "estimatedTime": "10min",
      "viralPotential": "alto",
      "targetPillar": "nome do pilar de conteúdo"
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
// 5. VISUAL AGENT
// ==========================
class VisualAgent {
  private systemPrompt = `Tu és o Visual Agent, especialista em criar estratégias visuais profissionais.`;

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
    
    await imageStorageService.ensureBucketExists();
    console.log('✅ Storage configurado e pronto');
    
    const mediaGenerated = [];
    let totalTokens = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      try {
        console.log(`\n🎬 Gerando media ${i + 1}/${posts.length}: ${post.mediaType || 'image'}`);

        if (post.mediaType === 'reel' || post.type === 'sales') {
          console.log('🎥 Gerando REEL com HeyGen...');
          
          const video = await heygenVideoService.generateVideoWithAvatar({
            script: post.videoScript || post.caption,
            aspectRatio: '9:16',
            background: '#FFFFFF',
          });
          
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
          console.log('🖼️ Gerando IMAGEM...');
          
          const shouldIncludeText = this.shouldIncludeTextInImage(post.type);
          
          const temporaryUrl = await imageGenerationService.generateImage({
            prompt: post.imagePrompt,
            style: this.selectStyleForPost(post.type, businessContext.tone),
            aspectRatio: '1:1',
          });

          console.log(`📥 Imagem temporária gerada, a guardar permanentemente...`);

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
        
        if (i < posts.length - 1) {
          console.log('⏳ Aguardando 3s...');
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar media para post ${post.type}:`, error);
        
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
  }
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

  private selectStyleForPost(postType: string, tone: string): 'professional' | 'vibrant' | 'minimalist' | 'realistic' | 'illustration' {
    const toneStyleMap: Record<string, 'professional' | 'vibrant' | 'minimalist' | 'realistic' | 'illustration'> = {
      professional: 'professional',
      casual: 'realistic',
      energetic: 'vibrant',
      elegant: 'professional',
      minimal: 'minimalist',
      bold: 'vibrant',
      authentic: 'realistic',
      luxury: 'professional',
    };

    const baseStyle = toneStyleMap[tone.toLowerCase()] || 'professional';

    if (postType === 'viral' || postType === 'entertainment') {
      return 'vibrant';
    }
    if (postType === 'sales' || postType === 'promotional') {
      return 'professional';
    }
    if (postType === 'educational') {
      return 'realistic';
    }

    return baseStyle;
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
    console.log('🤖 Multi-Agent System PREMIUM iniciado...');
    console.log('👥 Agentes: Strategy, Content PREMIUM, Visual, Analysis, Scheduling');

    // Fase 1: Strategy Agent
    console.log('📊 Strategy Agent a trabalhar...');
    const strategy = await this.strategyAgent.createStrategy(data);

    // Fase 2: Content Agent PREMIUM (gera 2 posts com imagem + 1 reel)
    console.log('✍️ Content Agent PREMIUM a gerar 3 posts...');
    const [initialPosts, contentIdeas] = await Promise.all([
      this.contentAgent.generateInitialPosts(data, strategy.result),
      this.contentAgent.generateContentIdeas(data, 10),
    ]);

    // 🆕 VALIDAÇÃO CRÍTICA
    if (!initialPosts.result.posts || initialPosts.result.posts.length !== 3) {
      console.error('❌ ERRO CRÍTICO: Content Agent não gerou 3 posts!');
      throw new Error('Content Agent falhou ao gerar posts completos');
    }

    // Fase 3: Visual Agent - GERA 2 IMAGENS + 1 VÍDEO
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
      ...(visualContent.result.media[index]?.mediaType === 'video' && {
        videoUrl: visualContent.result.media[index]?.videoUrl,
        thumbnailUrl: visualContent.result.media[index]?.thumbnailUrl,
        duration: visualContent.result.media[index]?.duration,
      }),
      ...(visualContent.result.media[index]?.mediaType === 'image' && {
        imageUrl: visualContent.result.media[index]?.imageUrl,
        temporaryImageUrl: visualContent.result.media[index]?.temporaryImageUrl,
        imagePath: visualContent.result.media[index]?.imagePath,
      }),
      mediaType: visualContent.result.media[index]?.mediaType,
      visualMetadata: visualContent.result.media[index],
    }));

    // 🆕 DEBUG FINAL DOS POSTS
    console.log('\n📊 RESUMO FINAL DOS POSTS:');
    postsWithMedia.forEach((post: any, i: number) => {
      console.log(`\nPOST ${i + 1}:`, {
        type: post.type,
        mediaType: post.mediaType,
        hasCaption: !!post.caption,
        captionLength: post.caption?.length,
        hasImage: !!post.imageUrl || !!post.videoUrl,
        qualityScore: post.qualityScore,
      });
    });

    // Fase 4: Analysis Agent
    console.log('\n🔍 Analysis Agent a analisar...');
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

    console.log('\n✅ Multi-Agent System PREMIUM concluído!');
    console.log(`💰 Tokens totais: ${totalTokens}`);
    console.log(`📸 2 Imagens geradas e guardadas`);
    console.log(`🎬 1 Reel gerado com HeyGen`);
    console.log(`📝 ${postsWithMedia.length} Posts com captions completas`);

    return {
      strategy: strategy.result,
      initialPosts: postsWithMedia,
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