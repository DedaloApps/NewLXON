// src/services/ai/multi-agent-system.ts
import OpenAI from 'openai';
import { imageGenerationService } from '@/services/media/image-generation.service';

// Import condicional do video service para evitar erros se não existir
let videoGenerationService: any;
try {
  videoGenerationService = require('@/services/media/video-generation.service').videoGenerationService;
} catch (e) {
  console.warn('Video generation service não encontrado, vídeos serão desativados');
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
// 2. CONTENT AGENT
// ==========================
class ContentAgent {
  private systemPrompt = `Tu és o Content Agent, mestre em criar conteúdo viral e envolvente.
Especializas-te em escrever captions que geram engagement, usando storytelling e psicologia.
Nunca crias conteúdo genérico - tudo é personalizado e estratégico.`;

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

Cria:
1. Um post EDUCATIVO (ensina algo valioso)
2. Um post VIRAL (entretenimento/relatable)
3. Um post de VENDAS/CTA (converte)

Formato JSON:
{
  "posts": [
    {
      "type": "educational",
      "hook": "Frase de abertura impactante",
      "caption": "Caption completa com storytelling",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "cta": "Call to action",
      "imagePrompt": "Descrição detalhada para gerar imagem com IA",
      "estimatedEngagement": "alto/médio/baixo",
      "bestTimeToPost": "09:00"
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

Cada ideia deve ter:
- Título/Hook cativante
- Tipo (carrossel/reel/post)
- Valor que entrega
- Dificuldade de criar (fácil/média/difícil)

JSON:
{
  "ideas": [
    {
      "title": "Como fazer X em 5 passos",
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
// 5. MEDIA AGENT (Com Vídeos)
// ==========================
class MediaAgent {
  private systemPrompt = `Tu és o Media Agent, especialista em geração de mídia visual e vídeo.
Transformas ideias em imagens e vídeos impactantes usando IA de última geração.`;

  async generateMediaForPosts(posts: any[]): Promise<any[]> {
    console.log(`🎨 Media Agent: A gerar mídia para ${posts.length} posts...`);
    
    const postsWithMedia = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // Decidir se é imagem ou vídeo baseado no tipo
      const shouldGenerateVideo = this.shouldBeVideo(post.type, i);
      
      if (shouldGenerateVideo && videoGenerationService) {
        console.log(`🎬 Gerando VÍDEO ${i + 1}/${posts.length}: ${post.hook}`);
        const videoPost = await this.generateVideoPost(post);
        postsWithMedia.push(videoPost);
      } else {
        console.log(`🖼️ Gerando IMAGEM ${i + 1}/${posts.length}: ${post.hook}`);
        const imagePost = await this.generateImagePost(post);
        postsWithMedia.push(imagePost);
      }

      // Delay para evitar rate limits
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Media Agent: ${postsWithMedia.length} mídias geradas!`);
    return postsWithMedia;
  }

  // Decidir se post deve ser vídeo (1 em cada 3 posts é vídeo)
  private shouldBeVideo(postType: string, index: number): boolean {
    // Se não tiver video service, nunca gera vídeo
    if (!videoGenerationService) return false;
    
    // Viral posts têm mais chance de ser vídeo
    if (postType === 'viral' && index === 1) return true;
    
    // Um post educativo pode ser reel explicativo
    if (postType === 'educational' && Math.random() > 0.7) return true;
    
    return false;
  }

  // Gerar post com imagem
  private async generateImagePost(post: any): Promise<any> {
    try {
      const styleMap: Record<string, string> = {
        educational: 'professional',
        viral: 'vibrant',
        sales: 'professional',
      };
      const style = styleMap[post.type] || 'professional';

      const imageUrl = await imageGenerationService.generateImage({
        prompt: post.imagePrompt || `Professional social media post about: ${post.hook}. Modern, clean design.`,
        style: style as any,
        aspectRatio: '1:1',
      });

      console.log(`✅ Imagem gerada: ${post.hook}`);

      return {
        ...post,
        imageUrl,
        format: 'SINGLE',
      };
    } catch (error) {
      console.error(`❌ Erro ao gerar imagem:`, error);
      
      return {
        ...post,
        imageUrl: `https://via.placeholder.com/1080x1080/3B82F6/FFFFFF?text=Post`,
        format: 'SINGLE',
      };
    }
  }

  // Gerar post com vídeo profissional
  private async generateVideoPost(post: any): Promise<any> {
    try {
      const styleMap: Record<string, string> = {
        educational: 'professional',
        viral: 'dynamic',
        sales: 'cinematic',
      };
      const style = styleMap[post.type] || 'cinematic';

      const videoResult = await videoGenerationService.generateProfessionalVideo({
        script: post.videoScript || post.caption,
        duration: 10,
        style: style as any,
        aspectRatio: '9:16',
        quality: 'high'
      });

      console.log(`✅ Vídeo gerado com ${videoResult.provider}: ${post.hook}`);

      return {
        ...post,
        format: 'REEL',
        videoUrl: videoResult.videoUrl,
        thumbnailUrl: videoResult.thumbnailUrl,
        duration: videoResult.duration,
        videoProvider: videoResult.provider,
      };
    } catch (error) {
      console.error(`❌ Erro ao gerar vídeo, usando imagem:`, error);
      
      // Fallback para imagem se vídeo falhar
      return await this.generateImagePost(post);
    }
  }
}

// ==========================
// ORCHESTRATOR - Coordena todos os agentes
// ==========================
export class AIOrchestrator {
  private strategyAgent: StrategyAgent;
  private contentAgent: ContentAgent;
  private analysisAgent: AnalysisAgent;
  private schedulingAgent: SchedulingAgent;
  private mediaAgent: MediaAgent;

  constructor() {
    this.strategyAgent = new StrategyAgent();
    this.contentAgent = new ContentAgent();
    this.analysisAgent = new AnalysisAgent();
    this.schedulingAgent = new SchedulingAgent();
    this.mediaAgent = new MediaAgent();
  }

  async processOnboarding(data: OnboardingData) {
    console.log('🤖 Multi-Agent System iniciado...');

    // Fase 1: Strategy Agent cria a estratégia
    console.log('📊 Strategy Agent a trabalhar...');
    const strategy = await this.strategyAgent.createStrategy(data);

    // Fase 2: Content Agent gera posts iniciais e ideias
    console.log('✍️ Content Agent a gerar conteúdo...');
    const [initialPosts, contentIdeas] = await Promise.all([
      this.contentAgent.generateInitialPosts(data, strategy.result),
      this.contentAgent.generateContentIdeas(data, 10),
    ]);

    // Fase 3: Media Agent gera imagens E VÍDEOS para os posts
    console.log('🎨 Media Agent a gerar mídia (imagens + vídeos)...');
    const postsWithMedia = await this.mediaAgent.generateMediaForPosts(
      initialPosts.result.posts
    );

    // Fase 4: Analysis Agent analisa perfil ideal
    console.log('🔍 Analysis Agent a analisar...');
    const profileAnalysis = await this.analysisAgent.analyzePerfectProfile(data);

    // Fase 5: Scheduling Agent cria calendário
    console.log('📅 Scheduling Agent a criar calendário...');
    const calendar = await this.schedulingAgent.createWeeklyCalendar(
      data,
      strategy.result,
      contentIdeas.result
    );

    const totalTokens =
      strategy.tokensUsed +
      initialPosts.tokensUsed +
      contentIdeas.tokensUsed +
      profileAnalysis.tokensUsed +
      calendar.tokensUsed;

    console.log('✅ Multi-Agent System concluído!');
    console.log(`💰 Tokens totais usados: ${totalTokens}`);
    console.log(`🖼️ Posts com mídia: ${postsWithMedia.length}`);
    console.log(`🎬 Vídeos gerados: ${postsWithMedia.filter(p => p.format === 'REEL').length}`);

    return {
      strategy: strategy.result,
      initialPosts: postsWithMedia, // COM IMAGENS E VÍDEOS!
      contentIdeas: contentIdeas.result.ideas,
      profileAnalysis: profileAnalysis.result,
      weeklyCalendar: calendar.result,
      metadata: {
        totalTokens,
        cost: (totalTokens / 1000) * 0.01,
        processingTime: new Date(),
        agents: [
          strategy.agent,
          initialPosts.agent,
          'MediaAgent',
          contentIdeas.agent,
          profileAnalysis.agent,
          calendar.agent,
        ],
      },
    };
  }
}