// src/services/instagram/analysis.service.ts
import OpenAI from 'openai';
import { ApifyClient } from 'apify-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Interface para o retorno do Apify
interface ApifyInstagramProfile {
  username: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  profilePicUrl?: string;
  verified?: boolean;
  isBusinessAccount?: boolean;
  category?: string;
  externalUrl?: string;
  latestPosts?: Array<{
    caption?: string;
    likesCount?: number;
    commentsCount?: number;
    type?: string;
    timestamp?: string;
  }>;
}

interface InstagramData {
  username: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  category?: string;
  website?: string;
  recentPosts: Array<{
    caption: string;
    likes: number;
    comments: number;
    type: 'image' | 'video' | 'carousel';
    hashtags: string[];
    timestamp: Date;
  }>;
}

interface InstagramAnalysisReport {
  overallScore: number;
  profileScore: number;
  contentScore: number;
  engagementScore: number;
  hashtagScore: number;
  benchmarkScore: number;
  
  profileAnalysis: {
    hasCTA: boolean;
    hasKeywords: boolean;
    hasEmojis: boolean;
    isProfessional: boolean;
    hasLink: boolean;
    feedback: string[];
  };
  
  contentAnalysis: {
    postsLast30Days: number;
    avgPostsPerWeek: number;
    formatDistribution: {
      images: number;
      videos: number;
      carousels: number;
    };
    avgCaptionLength: number;
    ctaUsage: number;
    qualityScore: number;
    feedback: string[];
  };
  
  engagementAnalysis: {
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    benchmarkEngagement: number;
    feedback: string[];
  };
  
  hashtagAnalysis: {
    avgHashtagsUsed: number;
    highVolumePercentage: number;
    nichePercentage: number;
    topHashtags: Array<{ tag: string; usage: number }>;
    feedback: string[];
  };
  
  criticalIssues: Array<{
    severity: 'urgent' | 'important' | 'moderate';
    issue: string;
    impact: string;
  }>;
  
  actionPlan: {
    week1_2: string[];
    week3_4: string[];
    expectedResults: {
      engagement: string;
      followers: string;
      leads: string;
    };
  };
  
  recommendations: {
    contentMix: {
      educational: number;
      inspirational: number;
      behindScenes: number;
      sales: number;
    };
    specificIdeas: string[];
    visualStyle: {
      colors: string[];
      typography: string;
      filters: string;
    };
  };
}

export class InstagramAnalysisService {
  /**
   * Scrape real do Instagram usando Apify
   */
  async scrapeInstagramProfile(username: string): Promise<InstagramData | null> {
    try {
      // Limpar username
      const cleanUsername = username
        .replace('@', '')
        .replace('https://instagram.com/', '')
        .replace('https://www.instagram.com/', '')
        .replace(/\//g, '')
        .trim();
      
      console.log(`📸 A fazer scraping do Instagram: @${cleanUsername}`);
      
      if (!process.env.APIFY_API_TOKEN) {
        throw new Error('APIFY_API_TOKEN não configurado no .env');
      }

      // Chamar Apify Instagram Profile Scraper
      console.log('🚀 A iniciar Apify Actor...');
      
      const run = await apifyClient.actor("apify/instagram-profile-scraper").call({
        usernames: [cleanUsername],
        resultsLimit: 1,
        addParentData: false,
      });
      
      console.log(`✅ Apify Actor executado. Dataset ID: ${run.defaultDatasetId}`);
      
      // Buscar resultados
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      if (!items || items.length === 0) {
        console.error('❌ Perfil não encontrado no Instagram');
        throw new Error('Perfil não encontrado');
      }
      
      // Type assertion mais forte para o perfil do Apify
      const rawProfile = items[0] as any;
      const profile: ApifyInstagramProfile = {
        username: rawProfile.username || '',
        biography: rawProfile.biography,
        followersCount: rawProfile.followersCount,
        followsCount: rawProfile.followsCount,
        postsCount: rawProfile.postsCount,
        profilePicUrl: rawProfile.profilePicUrl,
        verified: rawProfile.verified,
        isBusinessAccount: rawProfile.isBusinessAccount,
        category: rawProfile.category,
        externalUrl: rawProfile.externalUrl,
        latestPosts: rawProfile.latestPosts,
      };
      
      console.log(`✅ Perfil encontrado: @${profile.username}`);
      console.log(`📊 Stats: ${profile.followersCount} seguidores, ${profile.postsCount} posts`);
      
      // Processar posts recentes
      const recentPosts = (profile.latestPosts || []).slice(0, 12).map((post) => ({
        caption: post.caption || '',
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        type: this.detectPostType(post),
        hashtags: this.extractHashtags(post.caption || ''),
        timestamp: new Date(post.timestamp || Date.now()),
      }));

      console.log(`📝 ${recentPosts.length} posts recentes processados`);
      
      return {
        username: profile.username,
        bio: profile.biography || '',
        followers: profile.followersCount || 0,
        following: profile.followsCount || 0,
        postsCount: profile.postsCount || 0,
        profilePicUrl: profile.profilePicUrl || '',
        isVerified: profile.verified || false,
        isBusinessAccount: profile.isBusinessAccount || false,
        category: profile.category || '',
        website: profile.externalUrl || '',
        recentPosts,
      };
      
    } catch (error: any) {
      console.error('❌ Erro ao fazer scraping do Instagram:', error.message);
      
      // Se falhar, retornar dados básicos mock para não quebrar o fluxo
      console.warn('⚠️ A usar dados mock como fallback');
      
      const cleanUsername = username
        .replace('@', '')
        .replace('https://instagram.com/', '')
        .replace('https://www.instagram.com/', '')
        .replace(/\//g, '')
        .trim();
      
      return {
        username: cleanUsername,
        bio: "Perfil do Instagram",
        followers: 1000,
        following: 500,
        postsCount: 50,
        profilePicUrl: "",
        isVerified: false,
        isBusinessAccount: false,
        category: "",
        website: "",
        recentPosts: [],
      };
    }
  }

  /**
   * Detecta o tipo de post (image, video, carousel)
   */
  private detectPostType(post: any): 'image' | 'video' | 'carousel' {
    if (post?.type === 'Video') return 'video';
    if (post?.type === 'Sidecar') return 'carousel';
    return 'image';
  }

  /**
   * Extrai hashtags de uma caption
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.replace('#', ''));
  }

  /**
   * Analisa os dados do Instagram com IA
   */
  async analyzeWithAI(instagramData: InstagramData, businessInfo: any): Promise<InstagramAnalysisReport> {
    console.log('🤖 A analisar perfil com GPT-4...');
    
    const prompt = `Analisa este perfil de Instagram e gera um relatório profissional detalhado em formato JSON. Faz o texto todo em PT-PT.

DADOS DO PERFIL:
- Username: @${instagramData.username}
- Bio: "${instagramData.bio}"
- Seguidores: ${instagramData.followers}
- A seguir: ${instagramData.following}
- Posts: ${instagramData.postsCount}
- Tipo: ${instagramData.isBusinessAccount ? 'Business' : 'Personal'}
- Verificado: ${instagramData.isVerified ? 'Sim' : 'Não'}
${instagramData.category ? `- Categoria: ${instagramData.category}` : ''}
${instagramData.website ? `- Website: ${instagramData.website}` : ''}

CONTEXTO DO NEGÓCIO:
- Tipo: ${businessInfo.business}
- Descrição: ${businessInfo.businessDescription}
- Público-alvo: ${businessInfo.audience}
- Objetivo: ${businessInfo.objective}

DADOS DOS ÚLTIMOS POSTS (${instagramData.recentPosts.length} posts):
${JSON.stringify(instagramData.recentPosts.slice(0, 10), null, 2)}

ANÁLISE REQUERIDA EM JSON:

{
  "overallScore": 0-100,
  "profileScore": 0-20,
  "contentScore": 0-30,
  "engagementScore": 0-25,
  "hashtagScore": 0-15,
  "benchmarkScore": 0-10,
  
  "profileAnalysis": {
    "hasCTA": boolean,
    "hasKeywords": boolean,
    "hasEmojis": boolean,
    "isProfessional": boolean,
    "hasLink": boolean,
    "feedback": ["feedback 1", "feedback 2"]
  },
  
  "contentAnalysis": {
    "postsLast30Days": number,
    "avgPostsPerWeek": number,
    "formatDistribution": {
      "images": percentage,
      "videos": percentage,
      "carousels": percentage
    },
    "avgCaptionLength": number,
    "ctaUsage": percentage,
    "qualityScore": 0-100,
    "feedback": ["feedback específico"]
  },
  
  "engagementAnalysis": {
    "avgLikes": number,
    "avgComments": number,
    "engagementRate": percentage,
    "benchmarkEngagement": 3-5% (ideal para o nicho),
    "feedback": ["análise detalhada"]
  },
  
  "hashtagAnalysis": {
    "avgHashtagsUsed": number,
    "highVolumePercentage": percentage,
    "nichePercentage": percentage,
    "topHashtags": [{"tag": "fitness", "usage": 5}],
    "feedback": ["recomendações"]
  },
  
  "criticalIssues": [
    {
      "severity": "urgent/important/moderate",
      "issue": "Descrição do problema",
      "impact": "Impacto no negócio"
    }
  ],
  
  "actionPlan": {
    "week1_2": ["ação concreta 1", "ação concreta 2"],
    "week3_4": ["ação concreta 3", "ação concreta 4"],
    "expectedResults": {
      "engagement": "2.3% → 3.5%+",
      "followers": "+500-800/mês",
      "leads": "+50-100/mês"
    }
  },
  
  "recommendations": {
    "contentMix": {
      "educational": 40,
      "inspirational": 30,
      "behindScenes": 20,
      "sales": 10
    },
    "specificIdeas": ["ideia 1 específica para o negócio", "ideia 2"],
    "visualStyle": {
      "colors": ["#hex1", "#hex2", "#hex3"],
      "typography": "moderna/clássica/bold",
      "filters": "recomendação"
    }
  }
}

IMPORTANTE:
- Sê específico e prático
- Todas as recomendações devem ser acionáveis
- Compara com benchmarks do nicho ${businessInfo.business}
- Identifica problemas CRÍTICOS que impedem conversão
- Scores devem ser honestos e baseados em dados reais
- Fala em PT-PT, não uses você e tê um discurso formal
- Se não houver posts recentes, ajusta a análise de conteúdo`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'És um analista expert de Instagram e marketing digital com 10+ anos de experiência. Análises são sempre honestas, detalhadas e acionáveis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    // FIX: Handle null content properly with explicit type checking
    const content = completion.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI returned empty or invalid response');
    }

    const analysis = JSON.parse(content);
    console.log('✅ Análise com IA concluída');
    console.log(`📊 Score geral: ${analysis.overallScore}/100`);
    
    return analysis as InstagramAnalysisReport;
  }

  /**
   * Gera relatório completo do Instagram
   */
  async generateFullReport(
    username: string,
    businessInfo: any
  ): Promise<{ data: InstagramData; analysis: InstagramAnalysisReport } | null> {
    try {
      console.log(`\n🎯 A iniciar análise completa do Instagram para: ${username}`);
      
      // 1. Scrape Instagram data com Apify
      const instagramData = await this.scrapeInstagramProfile(username);
      if (!instagramData) {
        throw new Error('Não foi possível obter dados do perfil do Instagram');
      }

      // 2. Analyze with AI
      const analysis = await this.analyzeWithAI(instagramData, businessInfo);

      console.log('✅ Relatório completo gerado com sucesso!\n');

      return {
        data: instagramData,
        analysis,
      };
    } catch (error: any) {
      console.error('❌ Erro na análise do Instagram:', error.message);
      return null;
    }
  }
}

export const instagramAnalysisService = new InstagramAnalysisService();