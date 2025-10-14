// src/services/media/heygen-video.service.ts
import axios from 'axios';

interface HeyGenVideoOptions {
  script: string;
  avatar_id?: string;
  voice_id?: string;
  background?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

interface HeyGenVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: string;
}

export class HeyGenVideoService {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v2';

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ HEYGEN_API_KEY não configurada');
    }
  }

  // Gerar vídeo com avatar português
  async generateVideoWithAvatar(options: HeyGenVideoOptions): Promise<HeyGenVideoResult> {
    try {
      console.log(`🎬 Gerando vídeo HeyGen: "${options.script.substring(0, 50)}..."`);

      // Melhorar script para avatares portugueses
      const enhancedScript = this.enhanceScriptForPortuguese(options.script);

      // Configuração do vídeo (estrutura correta do HeyGen)
      const videoConfig = {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: options.avatar_id || this.getDefaultPortugueseAvatar(),
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: enhancedScript,
              voice_id: options.voice_id || this.getDefaultPortugueseVoice(),
            },
          },
        ],
        dimension: {
          width: options.aspectRatio === '9:16' ? 1080 : 1920,
          height: options.aspectRatio === '9:16' ? 1920 : 1080,
        },
        aspect_ratio: options.aspectRatio || '9:16',
        test: false,
      };

      console.log('📤 Enviando request para HeyGen API...');

      // Criar vídeo
      const createResponse = await axios.post(
        `${this.baseUrl}/video/generate`,
        videoConfig,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!createResponse.data || !createResponse.data.data) {
        throw new Error('Resposta inválida do HeyGen');
      }

      const videoId = createResponse.data.data.video_id;
      console.log(`📹 Vídeo criado com ID: ${videoId}`);

      // Poll para esperar vídeo ficar pronto
      const videoResult = await this.waitForVideoCompletion(videoId);

      console.log(`✅ Vídeo HeyGen pronto: ${videoResult.videoUrl}`);

      return videoResult;
    } catch (error: any) {
      console.error('Erro ao gerar vídeo HeyGen:', error.response?.data || error.message);
      
      // Se for erro de voz, tentar com voz alternativa
      if (error.response?.data?.error?.message?.includes('Voice not found')) {
        console.log('⚠️ Voz não encontrada, tentando com voz alternativa...');
        try {
          return await this.generateVideoWithAlternativeVoice(options);
        } catch (retryError) {
          console.error('Erro mesmo com voz alternativa:', retryError);
        }
      }
      
      // Fallback: retornar placeholder
      return this.getPlaceholderVideo(options.aspectRatio);
    }
  }

  // Tentar com voz alternativa (inglês como fallback)
  private async generateVideoWithAlternativeVoice(options: HeyGenVideoOptions): Promise<HeyGenVideoResult> {
    console.log('🔄 Tentando gerar vídeo com voz inglesa...');
    
    const videoConfig = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: 'Anna_public_3_20240108', // Avatar público
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: options.script,
            voice_id: '1bd001e7e50f421d891986aad5158bc8', // Voz padrão que funciona
          },
        },
      ],
      dimension: {
        width: 1080,
        height: 1920,
      },
      aspect_ratio: '9:16',
      test: false,
    };

    const response = await axios.post(
      `${this.baseUrl}/video/generate`,
      videoConfig,
      {
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const videoId = response.data.data.video_id;
    return await this.waitForVideoCompletion(videoId);
  }

  // Gerar vídeo de foto (Avatar IV)
  async generateFromPhoto(photoUrl: string, script: string): Promise<HeyGenVideoResult> {
    try {
      console.log(`📸 Gerando talking head de foto...`);

      const response = await axios.post(
        `${this.baseUrl}/video/generate`,
        {
          video_inputs: [
            {
              character: {
                type: 'photo_avatar',
                photo_url: photoUrl,
              },
              voice: {
                type: 'text',
                input_text: script,
                voice_id: this.getDefaultPortugueseVoice(),
              },
            },
          ],
          dimension: {
            width: 1080,
            height: 1920, // 9:16 para reels
          },
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const videoId = response.data.data.video_id;
      return await this.waitForVideoCompletion(videoId);
    } catch (error) {
      console.error('Erro ao gerar vídeo de foto:', error);
      return this.getPlaceholderVideo('9:16');
    }
  }

  // Esperar vídeo ficar pronto (polling)
  private async waitForVideoCompletion(
    videoId: string,
    maxAttempts: number = 60
  ): Promise<HeyGenVideoResult> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${this.baseUrl}/video/status`, {
          params: { video_id: videoId },
          headers: {
            'X-Api-Key': this.apiKey,
          },
        });

        const status = response.data.data.status;
        
        console.log(`⏳ Status do vídeo ${videoId}: ${status} (${i + 1}/${maxAttempts})`);

        if (status === 'completed') {
          return {
            videoUrl: response.data.data.video_url,
            thumbnailUrl: response.data.data.thumbnail_url || '',
            duration: response.data.data.duration || 0,
            status: 'completed',
          };
        }

        if (status === 'failed') {
          throw new Error('Geração de vídeo falhou');
        }

        // Esperar 5 segundos antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Erro ao verificar status:`, error);
      }
    }

    throw new Error('Timeout ao gerar vídeo');
  }

  // Melhorar script para português
  private enhanceScriptForPortuguese(script: string): string {
    // Garantir que o script não é muito longo (HeyGen tem limites)
    const maxLength = 1000;
    if (script.length > maxLength) {
      return script.substring(0, maxLength) + '...';
    }
    return script;
  }

  // Avatar português padrão
  private getDefaultPortugueseAvatar(): string {
    // IDs de avatares que parecem portugueses/europeus
    // Nota: Substituir pelos IDs reais da tua conta HeyGen
    const portugueseAvatars = [
      'Anna_public_3_20240108', // Mulher europeia
      'Tyler-incasualsuit-20220721', // Homem europeu
      'josh_lite3_20230714', // Profissional
    ];

    return portugueseAvatars[Math.floor(Math.random() * portugueseAvatars.length)];
  }

  // Voz portuguesa padrão
  private getDefaultPortugueseVoice(): string {
    // Voz portuguesa "Inês" da tua conta HeyGen
    return 'ff5719e3a6314ecea47badcbb1c0ffaa';
    
    // Backup: Se quiseres trocar, outras opções comuns:
    // '1bd001e7e50f421d891986aad5158bc8' - Camila (português)
    // '2d5b0e6cf36f41f1974ec554635b9455' - Diogo (masculino português)
  }

  // Placeholder vídeo
  private getPlaceholderVideo(aspectRatio?: string): HeyGenVideoResult {
    const isVertical = aspectRatio === '9:16';
    return {
      videoUrl: isVertical
        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://via.placeholder.com/1080x1920/3B82F6/FFFFFF?text=Video+Placeholder',
      duration: 10,
      status: 'placeholder',
    };
  }

  // Listar avatares disponíveis
  async listAvailableAvatars(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/avatars`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      return response.data.data.avatars;
    } catch (error) {
      console.error('Erro ao listar avatares:', error);
      return [];
    }
  }

  // Listar vozes disponíveis
  async listAvailableVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      console.log('🎤 Vozes disponíveis no HeyGen:');
      
      // Filtrar e mostrar vozes portuguesas
      const allVoices = response.data.data.voices || [];
      const portugueseVoices = allVoices.filter((voice: any) =>
        voice.language?.toLowerCase().includes('portuguese') || 
        voice.language_code?.toLowerCase().includes('pt') ||
        voice.gender?.toLowerCase().includes('pt')
      );

      console.log(`\n📍 Vozes Portuguesas (${portugueseVoices.length}):`);
      portugueseVoices.forEach((voice: any) => {
        console.log(`  - ${voice.name} (${voice.voice_id})`);
        console.log(`    Idioma: ${voice.language}, Género: ${voice.gender}`);
      });

      console.log(`\n🌍 Total de vozes disponíveis: ${allVoices.length}`);
      
      return allVoices;
    } catch (error: any) {
      console.error('Erro ao listar vozes:', error.response?.data || error.message);
      return [];
    }
  }
}

export const heygenVideoService = new HeyGenVideoService();