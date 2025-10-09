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

// ADICIONAR ao multi-agent-system.ts (ANTES do ContentAgent)

// ==========================
// 1.5 MARKETING STRATEGIST AGENT (NOVO!)
// ==========================
class MarketingStrategistAgent {
  private systemPrompt = `És o Marketing Strategist Agent, um EXPERT em marketing digital e copywriting com PhD em Psicologia do Consumidor.

ESPECIALIDADES:
- Copywriting persuasivo baseado em neurociência
- Storytelling que converte
- Gatilhos mentais (escassez, autoridade, prova social, reciprocidade)
- Frameworks AIDA, PAS, PASTOR
- Psicologia de cores e emoções
- Análise de comportamento do consumidor
- Estratégias virais e growth hacking
- Social proof e FOMO

REGRAS CRÍTICAS DE LINGUAGEM:
- SEMPRE usar PT-PT (português de Portugal)
- NUNCA usar "você" - usar "tu", "vós" ou evitar pronome direto
- Usar "és", "tens", "estás" (não "você é", "você tem")
- Frases naturais como português falado em Portugal
- Tom adequado ao público português

REGRAS DE COPYWRITING:
1. Primeira frase DEVE captar atenção (pattern interrupt)
2. Contar história que gera emoção
3. Usar gatilhos mentais comprovados
4. CTA claro e acionável
5. Criar FOMO ou urgência quando apropriado
6. Prova social quando relevante
7. Fazer perguntas que envolvem o leitor
8. Criar identificação ("Já te aconteceu...")

CONHECIMENTO DE MERCADO:
- Conheces profundamente todos os nichos
- Sabes exatamente o que funciona em cada mercado
- Aplicas estudos de comportamento do consumidor
- Usas dados de performance de milhares de posts
- Adaptas estratégia ao objetivo (venda vs. engagement vs. educação)`;

  async createStrategicContent(
    postType: string,
    niche: string,
    objective: string,
    audience: string,
    tone: string,
    contentPillars: any[]
  ): Promise<{
    hook: string;
    caption: string;
    cta: string;
    strategy: {
      triggers: string[];
      framework: string;
      emotionalTone: string;
      expectedEngagement: string;
      reasoning: string;
    };
  }> {
    const prompt = `Cria copy MATADOR para um post de ${postType} em PT-PT:

CONTEXTO DO NEGÓCIO:
- Nicho: ${niche}
- Objetivo principal: ${objective}
- Público-alvo: ${audience}
- Tom de voz: ${tone}
- Pilares de conteúdo: ${contentPillars.map((p: any) => p.name).join(', ')}

TIPO DE POST: ${postType}
${postType === 'educational' ? '→ Ensinar algo valioso que gere confiança e autoridade' : ''}
${postType === 'viral' ? '→ Criar identificação máxima, entretenimento, partilhável' : ''}
${postType === 'sales' ? '→ Converter em ação (venda, lead, agendamento)' : ''}

ESTRATÉGIA REQUERIDA:
1. Identifica os 3 gatilhos mentais mais eficazes para este caso
2. Escolhe o framework de copywriting ideal (AIDA/PAS/PASTOR)
3. Define o tom emocional (inspiração/urgência/curiosidade/identificação)
4. Aplica técnicas de storytelling se relevante
5. Cria urgência ou FOMO quando apropriado

CRÍTICO - LINGUAGEM PT-PT:
- NUNCA "você" → usar "tu" ou reformular
- Exemplos corretos:
  ✅ "Já te aconteceu isto?"
  ✅ "Sabias que..."
  ✅ "Se és como a maioria das pessoas..."
  ✅ "Podes fazer isto hoje mesmo"
- Evitar:
  ❌ "Você sabia"
  ❌ "Você pode"
  ❌ "Você está"

ESTRUTURA DO POST:
1. HOOK (primeira linha): Parar scroll, gerar curiosidade, criar urgência
2. CORPO: História/ensinamento/identificação com estrutura estratégica
3. CTA: Claro, específico, acionável

Retorna JSON:
{
  "hook": "Primeira linha MATADORA que para o scroll",
  "caption": "Corpo completo do post em PT-PT com storytelling e gatilhos",
  "cta": "Call to action claro e específico",
  "strategy": {
    "triggers": ["gatilho 1", "gatilho 2", "gatilho 3"],
    "framework": "AIDA/PAS/PASTOR",
    "emotionalTone": "emoção principal",
    "expectedEngagement": "alto/médio/baixo + porquê",
    "reasoning": "Explicação da estratégia aplicada"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85, // Criatividade alta mas controlada
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  }

  /**
   * Analisa nichos e retorna insights de mercado
   */
  async analyzeNicheStrategy(niche: string): Promise<{
    topPerformingAngles: string[];
    avoidContent: string[];
    bestPractices: string[];
    psychologicalTriggers: string[];
  }> {
    const prompt = `Como expert em marketing, analisa o nicho "${niche}" e retorna insights:

Baseado em milhares de posts analisados neste nicho, identifica:

1. **Top 3 ângulos que mais performam** (tipos de conteúdo que geram mais engagement)
2. **O que evitar** (erros comuns que matam engagement)
3. **Best practices específicas** do nicho
4. **Gatilhos psicológicos** mais eficazes para este público

Retorna JSON:
{
  "topPerformingAngles": ["ângulo 1 + porquê funciona", "ângulo 2 + porquê", "ângulo 3 + porquê"],
  "avoidContent": ["erro 1", "erro 2", "erro 3"],
  "bestPractices": ["prática 1", "prática 2", "prática 3"],
  "psychologicalTriggers": ["trigger 1 + como usar", "trigger 2 + como usar", "trigger 3 + como usar"]
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

    return JSON.parse(completion.choices[0].message.content || '{}');
  }
}

// ==========================
// 2. CONTENT AGENT ATUALIZADO (Substituir o existente)
// ==========================
class ContentAgent {
  private systemPrompt = `Tu és o Content Agent, executor de conteúdo de elite.
Trabalhas em conjunto com o Marketing Strategist Agent.
Crias imagePrompts realistas e formatação final de posts.

RESPONSABILIDADES:
- Criar imagePrompts fotográficos e realistas
- Formatar hashtags estrategicamente
- Definir melhor horário de publicação
- Adicionar emojis quando apropriado
- Estruturar post para máximo impacto visual

REGRAS DE IMAGEM:
- Sempre descrever como FOTOGRAFIA PROFISSIONAL
- Se pessoas: "real person, natural features, authentic moment"
- Ambientes específicos e reais
- Iluminação natural
- Zero menções a ilustração/design/gráfico`;

  async generateInitialPosts(
    data: OnboardingData,
    strategy: any,
    marketingStrategist: MarketingStrategistAgent
  ): Promise<AgentResponse<any>> {
    console.log('🎯 Marketing Strategist a criar estratégia de copy...');
    
    // Primeiro, o Marketing Strategist analisa o nicho
    const nicheInsights = await marketingStrategist.analyzeNicheStrategy(data.niche);
    console.log('📊 Insights de mercado obtidos:', nicheInsights.topPerformingAngles);

    // Criar 3 posts com estratégia profissional
    const postTypes = ['educational', 'viral', 'sales'];
    const posts = [];

    for (const type of postTypes) {
      console.log(`✍️ Criando post ${type}...`);
      
      // Marketing Strategist cria o copy estratégico
      const strategicCopy = await marketingStrategist.createStrategicContent(
        type,
        data.niche,
        data.objective,
        data.audience || 'público geral',
        data.tone,
        strategy.contentPillars
      );

      // Content Agent complementa com imagem e hashtags
      const imagePrompt = await this.createRealisticImagePrompt(
        type,
        strategicCopy.hook,
        data.niche
      );

      const hashtags = this.selectStrategicHashtags(
        type,
        data.niche,
        strategy.hashtagStrategy
      );

      posts.push({
        type,
        hook: strategicCopy.hook,
        caption: strategicCopy.caption,
        cta: strategicCopy.cta,
        imagePrompt,
        hashtags,
        strategy: strategicCopy.strategy,
        estimatedEngagement: strategicCopy.strategy.expectedEngagement,
        bestTimeToPost: this.getBestTimeForType(type, strategy.postingSchedule),
      });

      // Delay entre gerações
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      agent: 'ContentAgent',
      result: {
        posts,
        nicheInsights,
      },
      tokensUsed: 0, // Calcular depois
      timestamp: new Date(),
    };
  }

  private async createRealisticImagePrompt(
    postType: string,
    hook: string,
    niche: string
  ): Promise<string> {
    // Contexto específico por tipo de post
    const contexts: Record<string, string> = {
      educational: 'professional setting, instructional moment, clear demonstration',
      viral: 'relatable situation, authentic moment, behind-the-scenes feel',
      sales: 'professional environment, trustworthy setting, high-end quality',
    };

    // Base do prompt sempre realista
    const basePrompt = `Professional DSLR photograph shot on Canon EOS R5, 85mm f/1.8 lens, natural lighting, photojournalistic style.`;
    
    // Contexto do nicho
    const nicheContext = this.getNichePhotoContext(niche);
    
    // Contexto do tipo de post
    const typeContext = contexts[postType] || contexts.educational;

    // Descrição baseada no hook
    const sceneDescription = this.extractSceneFromHook(hook, niche);

    return `${basePrompt} ${sceneDescription}. ${nicheContext}. ${typeContext}. Real person with natural features, authentic expression, genuine moment captured. 8K quality, realistic colors, shallow depth of field.`;
  }

  private getNichePhotoContext(niche: string): string {
    const contexts: Record<string, string> = {
      fitness: 'Modern gym environment, athletic setting, real workout equipment',
      food: 'Real restaurant or kitchen, authentic culinary environment',
      fashion: 'Real boutique or urban setting, authentic fashion scene',
      beauty: 'Natural salon setting, authentic beauty environment',
      tech: 'Real office workspace, modern tech environment',
      coaching: 'Professional consultation space, mentoring environment',
    };

    const lowerNiche = niche.toLowerCase();
    for (const [key, value] of Object.entries(contexts)) {
      if (lowerNiche.includes(key)) return value;
    }

    return 'Professional real-world setting, authentic environment';
  }

  private extractSceneFromHook(hook: string, niche: string): string {
    // Extrair ação/cena do hook
    // Exemplo: "3 erros que estás a cometer no treino" → "person training in gym making common mistakes"
    
    const lowerHook = hook.toLowerCase();
    const lowerNiche = niche.toLowerCase();
    
    if (lowerNiche.includes('fitness') || lowerNiche.includes('gym')) {
      if (lowerHook.includes('erro') || lowerHook.includes('errado')) {
        return 'Real personal trainer demonstrating correct form to avoid common mistakes';
      }
      return 'Real athlete training in authentic gym setting';
    }
    
    if (lowerNiche.includes('food') || lowerNiche.includes('restaurante')) {
      return 'Real chef or food professional in authentic kitchen environment';
    }

    return `Real professional in authentic ${niche} setting`;
  }

  private selectStrategicHashtags(
    postType: string,
    niche: string,
    hashtagStrategy: any
  ): string[] {
    // Mix estratégico: 30% alto volume, 50% médio, 20% nicho
    const high = hashtagStrategy.high?.slice(0, 2) || [];
    const medium = hashtagStrategy.medium?.slice(0, 3) || [];
    const nicheHash = hashtagStrategy.niche?.slice(0, 2) || [];

    return [...high, ...medium, ...nicheHash];
  }

  private getBestTimeForType(postType: string, schedule: any): string {
    const times = schedule.bestTimes || ['09:00', '13:00', '19:00'];
    
    const typeTimeMap: Record<string, number> = {
      educational: 0, // Manhã (09:00)
      viral: 2,       // Noite (19:00)
      sales: 1,       // Meio-dia (13:00)
    };

    const index = typeTimeMap[postType] || 0;
    return times[index] || times[0];
  }

  async generateContentIdeas(
    data: OnboardingData,
    count: number = 10
  ): Promise<AgentResponse<any>> {
    const prompt = `Gera ${count} ideias de conteúdo específicas para:
    
Nicho: ${data.niche}
Objetivo: ${data.objective}
Tom: ${data.tone}

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


// src/services/ai/multi-agent-system.ts
// ADICIONAR ESTE AGENTE AO FICHEIRO EXISTENTE



// src/services/ai/multi-agent-system.ts
// ADICIONAR ESTE AGENTE AO FICHEIRO EXISTENTE

// ==========================
// 5. VISUAL AGENT (NOVO!)
// ==========================
class VisualAgent {
  private systemPrompt = `Tu és o Visual Agent, especialista em criar estratégias visuais profissionais.
És expert em:
- Criar prompts detalhados para geração de imagens por IA
- Garantir consistência visual da marca
- Otimizar imagens para engajamento em redes sociais
- Criar texto legível e impactante em imagens
- Escolher o estilo visual ideal para cada tipo de conteúdo

Pensas como um diretor de arte com 10+ anos de experiência em social media.`;

  /**
   * Gera imagens para os posts iniciais
   */
  async generateImagesForPosts(
    posts: any[],
    businessContext: {
      niche: string;
      audience?: string;
      tone: string;
    }
  ): Promise<AgentResponse<any>> {
    console.log(`🎨 Visual Agent a gerar ${posts.length} imagens...`);
    
    const imagesGenerated = [];
    let totalTokens = 0;

    for (const post of posts) {
      try {
        // Decidir se deve incluir texto na imagem
        const shouldIncludeText = this.shouldIncludeTextInImage(post.type);
        
        // Extrair contexto do negócio
        const context = {
          businessType: this.extractBusinessType(businessContext.niche),
          targetAudience: businessContext.audience || 'geral',
          contentGoal: this.mapPostTypeToGoal(post.type),
        };

        // Gerar a imagem com o serviço otimizado
        const imageUrl = await imageGenerationService.generateImage({
          prompt: post.imagePrompt,
          style: this.selectStyleForPost(post.type, businessContext.tone),
          aspectRatio: '1:1',
          imageType: 'post',
          context,
          ...(shouldIncludeText && {
            includeText: {
              mainText: this.extractMainText(post.hook || post.caption),
              style: 'bold',
            },
          }),
        });

        imagesGenerated.push({
          postType: post.type,
          imageUrl,
          imagePrompt: post.imagePrompt,
          hasText: shouldIncludeText,
        });

        console.log(`✅ Imagem ${imagesGenerated.length}/${posts.length} gerada`);
        
        // Delay para evitar rate limits
        if (imagesGenerated.length < posts.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar imagem para post ${post.type}:`, error);
        
        // Usar placeholder em caso de erro
        imagesGenerated.push({
          postType: post.type,
          imageUrl: 'https://via.placeholder.com/1080x1080/3B82F6/FFFFFF?text=Placeholder',
          imagePrompt: post.imagePrompt,
          hasText: false,
          error: true,
        });
      }
    }

    return {
      agent: 'VisualAgent',
      result: {
        images: imagesGenerated,
        visualStrategy: await this.createVisualStrategy(businessContext),
      },
      tokensUsed: totalTokens,
      timestamp: new Date(),
    };
  }

  /**
   * Cria estratégia visual da marca
   */
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

  /**
   * Decide se deve incluir texto na imagem
   */
  private shouldIncludeTextInImage(postType: string): boolean {
    const typesWithText = ['educational', 'announcement', 'promotional', 'tip'];
    return typesWithText.includes(postType.toLowerCase());
  }

  /**
   * Extrai tipo de negócio do nicho
   */
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

  /**
   * Mapeia tipo de post para objetivo
   */
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

  /**
   * Seleciona estilo visual para o post
   */
  private selectStyleForPost(postType: string, tone: string): 'professional' | 'vibrant' | 'authentic' | 'minimalist' | 'luxury' {
    // Mapear tom para estilo
    const toneStyleMap: Record<string, 'professional' | 'vibrant' | 'authentic' | 'minimalist' | 'luxury'> = {
      professional: 'professional',
      casual: 'authentic',
      energetic: 'vibrant',
      elegant: 'luxury',
      minimal: 'minimalist',
      bold: 'vibrant',
    };

    // Se o tom especificar um estilo, usa esse
    const baseStyle = toneStyleMap[tone.toLowerCase()] || 'professional';

    // Ajustar baseado no tipo de post
    if (postType === 'viral' || postType === 'entertainment') {
      return 'vibrant';
    }
    if (postType === 'sales' || postType === 'promotional') {
      return 'professional';
    }

    return baseStyle;
  }

  /**
   * Extrai texto principal para a imagem
   */
  private extractMainText(text: string): string {
    // Pegar primeiras 3 palavras ou até 25 caracteres
    const words = text.split(' ').slice(0, 3).join(' ');
    return words.length > 25 ? words.substring(0, 22) + '...' : words;
  }

  /**
   * Estratégia visual padrão (fallback)
   */
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

export class AIOrchestrator {
  private strategyAgent: StrategyAgent;
  private marketingStrategist: MarketingStrategistAgent; // NOVO!
  private contentAgent: ContentAgent;
  private analysisAgent: AnalysisAgent;
  private schedulingAgent: SchedulingAgent;
  private visualAgent: VisualAgent;

  constructor() {
    this.strategyAgent = new StrategyAgent();
    this.marketingStrategist = new MarketingStrategistAgent(); // NOVO!
    this.contentAgent = new ContentAgent();
    this.analysisAgent = new AnalysisAgent();
    this.schedulingAgent = new SchedulingAgent();
    this.visualAgent = new VisualAgent();
  }

  async processOnboarding(data: OnboardingData) {
    console.log('🤖 Multi-Agent System iniciado...');
    console.log('👥 Agentes: Strategy, Marketing Strategist (NOVO!), Content, Visual, Analysis, Scheduling');

    // Fase 1: Strategy Agent cria estratégia geral
    console.log('📊 Strategy Agent a trabalhar...');
    const strategy = await this.strategyAgent.createStrategy(data);

    // Fase 2: Marketing Strategist + Content Agent criam posts
    console.log('🎯 Marketing Strategist Agent a criar copy estratégico em PT-PT...');
    const initialPosts = await this.contentAgent.generateInitialPosts(
      data,
      strategy.result,
      this.marketingStrategist // PASSA O MARKETING STRATEGIST!
    );

    // Fase 3: Content Agent gera ideias adicionais
    console.log('💡 Content Agent a gerar ideias...');
    const contentIdeas = await this.contentAgent.generateContentIdeas(data, 10);

    // Fase 4: Visual Agent - GERA AS IMAGENS! 🎨
    console.log('🎨 Visual Agent a criar imagens ultra-realistas...');
    const visualContent = await this.visualAgent.generateImagesForPosts(
      initialPosts.result.posts,
      {
        niche: data.niche,
        audience: data.audience,
        tone: data.tone,
      }
    );

    // Combinar posts com imagens geradas
    const postsWithImages = initialPosts.result.posts.map((post: any, index: number) => ({
      ...post,
      imageUrl: visualContent.result.images[index]?.imageUrl,
      visualMetadata: visualContent.result.images[index],
    }));

    // Fase 5: Analysis Agent
    console.log('🔍 Analysis Agent a analisar...');
    const profileAnalysis = await this.analysisAgent.analyzePerfectProfile(data);

    // Fase 6: Scheduling Agent
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
    console.log(`🎯 Posts criados com estratégia de marketing profissional!`);
    console.log(`🇵🇹 Linguagem: PT-PT (português de Portugal)`);

    return {
      strategy: strategy.result,
      initialPosts: postsWithImages, // Com imagens E copy estratégico!
      contentIdeas: contentIdeas.result.ideas,
      nicheInsights: initialPosts.result.nicheInsights, // NOVO!
      profileAnalysis: profileAnalysis.result,
      weeklyCalendar: calendar.result,
      visualStrategy: visualContent.result.visualStrategy,
      metadata: {
        totalTokens,
        cost: (totalTokens / 1000) * 0.01,
        processingTime: new Date(),
        agents: [
          strategy.agent,
          'MarketingStrategistAgent', // NOVO!
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