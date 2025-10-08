// src/services/instagram/analysis.service.ts
import OpenAI from 'openai';
import { ApifyClient } from 'apify-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

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
  // Simular scraping do Instagram (em produção usar Apify ou similar)
  async scrapeInstagramProfile(username: string): Promise<InstagramData | null> {
    // TODO: Integrar com API real (Apify, Bright Data, etc)
    // Por agora, retorna dados mockados para desenvolvimento
    
    // Remover @ se existir
    const cleanUsername = username.replace('@', '').replace('https://instagram.com/', '');
    
    // Em produção, fazer request real aqui
    // const response = await fetch(`https://api.apify.com/v2/acts/...`);
    
    // Mock data para desenvolvimento
    return {
      username: cleanUsername,
      bio: "Fitness Coach | Transforming Lives 💪 | DM for coaching",
      followers: 5420,
      following: 890,
      postsCount: 127,
      profilePicUrl: "https://example.com/pic.jpg",
      isVerified: false,
      isBusinessAccount: true,
      category: "Fitness",
      website: "https://example.com",
      recentPosts: [
        {
          caption: "New workout routine! Check link in bio #fitness #workout",
          likes: 145,
          comments: 8,
          type: 'image',
          hashtags: ['fitness', 'workout', 'gym'],
          timestamp: new Date('2025-01-05'),
        },
        // Adicionar mais posts mockados...
      ],
    };
  }

  async analyzeWithAI(instagramData: InstagramData, businessInfo: any): Promise<InstagramAnalysisReport> {
    const prompt = `Analisa este perfil de Instagram e gera um relatório profissional detalhado em formato JSON.

DADOS DO PERFIL:
- Username: @${instagramData.username}
- Bio: "${instagramData.bio}"
- Seguidores: ${instagramData.followers}
- Posts: ${instagramData.postsCount}
- Tipo: ${instagramData.isBusinessAccount ? 'Business' : 'Personal'}

CONTEXTO DO NEGÓCIO:
- Tipo: ${businessInfo.business}
- Descrição: ${businessInfo.businessDescription}
- Público-alvo: ${businessInfo.audience}
- Objetivo: ${businessInfo.objective}

DADOS DOS ÚLTIMOS POSTS:
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
- Scores devem ser honestos e baseados em dados`;

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

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return analysis as InstagramAnalysisReport;
  }

  async generateFullReport(
    username: string,
    businessInfo: any
  ): Promise<{ data: InstagramData; analysis: InstagramAnalysisReport } | null> {
    try {
      // 1. Scrape Instagram data
      const instagramData = await this.scrapeInstagramProfile(username);
      if (!instagramData) {
        throw new Error('Não foi possível encontrar o perfil do Instagram');
      }

      // 2. Analyze with AI
      const analysis = await this.analyzeWithAI(instagramData, businessInfo);

      return {
        data: instagramData,
        analysis,
      };
    } catch (error) {
      console.error('Erro na análise do Instagram:', error);
      return null;
    }
  }
}

export const instagramAnalysisService = new InstagramAnalysisService();