interface LumaVideoOptions {
  prompt: string;
  duration?: '5s' | '9s' | '10s';  // 🔄 Adicionar '9s'
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '540p' | '720p' | '1080p' | '4k';
}

interface LumaVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  cost: number;
}

export class LumaVideoService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY;
  }

  async generateVideo(options: LumaVideoOptions): Promise<LumaVideoResult> {
    if (!this.apiKey) {
      throw new Error('LUMA_API_KEY não configurado');
    }

    const { prompt, duration = '5s', aspectRatio = '9:16', resolution = '720p' } = options;

    console.log('🎬 Luma Dream Machine (API REST) iniciando...');
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}..."`);

    try {
      // 1. Criar geração
      const createResponse = await fetch(`${this.baseUrl}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',  // 🆕 Adicionar conforme docs
        },
        body: JSON.stringify({
          prompt: this.enhancePromptForLuma(prompt),
          model: 'ray-2',  // 🔄 Usar 'ray-2' (modelos válidos: ray-2, ray-flash-2, ray-1-6)
          aspect_ratio: aspectRatio,
          resolution: resolution,  // 🆕 Adicionar resolution
          duration: duration,  // 🆕 Adicionar duration no formato correto
          loop: false,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Luma API error: ${error}`);
      }

      const generation = await createResponse.json();
      const generationId = generation.id;

      console.log(`🆔 Generation ID: ${generationId}`);
      console.log('⏳ Aguardando geração (2-4 minutos)...');

      // 2. Polling até completar
      let completed = false;
      let attempts = 0;
      const maxAttempts = 80; // 4 minutos

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const statusResponse = await fetch(
          `${this.baseUrl}/generations/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Erro ao verificar status');
        }

        const result = await statusResponse.json();
        
        console.log(`🔄 Status: ${result.state} (${attempts + 1}/${maxAttempts})`);

        if (result.state === 'completed') {
          completed = true;

          // 🔄 Estrutura correta conforme docs
          const videoUrl = result.assets?.video;

          if (!videoUrl) {
            throw new Error('Video URL não disponível no resultado');
          }

          console.log('✅ Vídeo Luma gerado!');
          console.log(`🔗 URL: ${videoUrl.substring(0, 80)}...`);

          return {
            videoUrl,
            thumbnailUrl: videoUrl,
            duration: duration === '5s' ? 5 : 10,
            cost: 0.50,
          };
        } else if (result.state === 'failed') {
          throw new Error(`Geração falhou: ${result.failure_reason || 'Unknown'}`);
        }

        attempts++;
      }

      throw new Error('Timeout: Geração demorou mais de 4 minutos');
    } catch (error: any) {
      console.error('❌ Erro Luma:', error.message);
      throw error;
    }
  }

  async generateReelVideo(options: {
    script: string;
    duration?: '5s' | '9s' | '10s';  // 🔄 Atualizar tipo
    context?: any;
  }): Promise<LumaVideoResult> {
    const prompt = this.createReelPrompt(options.script, options.context);

    return this.generateVideo({
      prompt,
      duration: options.duration || '9s',
      aspectRatio: '9:16',
      resolution: '720p',  // 🆕 Adicionar resolution
    });
  }

  private createReelPrompt(script: string, context?: any): string {
    const keywords = this.extractKeywords(script);

    return `Professional vertical Instagram Reel showing: ${keywords.join(', ')}, 
cinematic camera movement, smooth tracking shot, high energy, vibrant colors, 
modern aesthetic, dynamic composition, 9:16 vertical format, commercial quality`;
  }

  private enhancePromptForLuma(prompt: string): string {
    const enhancements = [
      'cinematic lighting',
      'professional cinematography',
      'smooth camera work',
      'high production value',
      'vibrant natural colors',
      'dynamic movement',
    ];

    const selected = enhancements
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return `${prompt}, ${selected.join(', ')}`;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = [
      'o', 'a', 'de', 'da', 'do', 'em', 'para', 'com', 'que', 'um', 'uma',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'
    ];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    return words.slice(0, 5);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const lumaVideoService = new LumaVideoService();