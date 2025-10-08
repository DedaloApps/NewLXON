// src/services/media/video-generation.service.ts
import Replicate from 'replicate';
import { imageGenerationService } from './image-generation.service';

const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    })
  : null;

interface VideoGenerationOptions {
  script: string;
  duration: number; // segundos
  style?: 'dynamic' | 'calm' | 'energetic';
  voiceover?: boolean;
}

export class VideoGenerationService {
  // Gerar vídeo simples (imagem animada)
  async generateAnimatedImage(imageUrl: string): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    try {
      console.log('🎬 Gerando vídeo animado...');

      // Usar Stable Video Diffusion para animar imagem
      const output = await replicate.run(
        'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        {
          input: {
            input_image: imageUrl,
            sizing_strategy: 'maintain_aspect_ratio',
            frames_per_second: 6,
            motion_bucket_id: 127,
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;
      console.log(`✅ Vídeo gerado: ${videoUrl}`);

      return videoUrl as string;
    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      throw error;
    }
  }

  // Gerar Reel/Short completo
  async generateReel(options: VideoGenerationOptions): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  }> {
    try {
      console.log('🎬 Gerando Reel...');

      // 1. Gerar imagem base do script
      const imageUrl = await imageGenerationService.generateImage({
        prompt: `Visual representation of: ${options.script}`,
        style: 'vibrant',
        aspectRatio: '9:16',
      });

      // 2. Animar a imagem
      const videoUrl = await this.generateAnimatedImage(imageUrl);

      // 3. (Opcional) Adicionar voiceover com ElevenLabs
      // TODO: Implementar se necessário

      return {
        videoUrl,
        thumbnailUrl: imageUrl,
        duration: options.duration,
      };
    } catch (error) {
      console.error('Erro ao gerar Reel:', error);
      throw error;
    }
  }

  // Gerar vídeo com texto-to-video (RunwayML)
  async generateFromText(prompt: string): Promise<string> {
    if (!replicate) {
      throw new Error('REPLICATE_API_KEY não configurado');
    }

    try {
      console.log(`🎬 Gerando vídeo de: "${prompt}"`);

      // Usar modelo de text-to-video
      const output = await replicate.run(
        'deforum/deforum_stable_diffusion:e22e77495f2fb83c34d5fae2ad8ab63c0a87b6b573b6208e1535b23b89ea66d6',
        {
          input: {
            prompt: prompt,
            animation_prompts: prompt,
            max_frames: 60, // 2 segundos a 30fps
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;
      console.log(`✅ Vídeo gerado: ${videoUrl}`);

      return videoUrl as string;
    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      throw error;
    }
  }

  // Placeholder vídeo caso API falhe
  private getPlaceholderVideo(): string {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }
}

export const videoGenerationService = new VideoGenerationService();