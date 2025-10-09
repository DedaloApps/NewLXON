// src/services/media/video-generation.service.ts
import Replicate from 'replicate';
import OpenAI from 'openai';
import axios from 'axios';
import { imageGenerationService } from './image-generation.service';

const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({ auth: process.env.REPLICATE_API_KEY })
  : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VideoGenerationOptions {
  script: string;
  duration?: number;
  style?: 'cinematic' | 'professional' | 'dynamic' | 'calm';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high' | 'ultra';
  addVoiceover?: boolean;
  voiceGender?: 'male' | 'female';
  addMusic?: boolean;
}

interface VideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  format: string;
  provider: string;
}

export class VideoGenerationService {
  
  // ============================================
  // MÉTODO PRINCIPAL - Escolhe melhor API
  // ============================================
  async generateProfessionalVideo(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('🎬 Iniciando geração profissional de vídeo...');
    
    try {
      // Prioridade: Google Veo 3 > Runway > Kling > Luma
      if (process.env.GOOGLE_API_KEY) {
        return await this.generateWithVeo3(options);
      } else if (process.env.RUNWAY_API_KEY) {
        return await this.generateWithRunway(options);
      } else if (replicate) {
        return await this.generateWithKling(options);
      } else {
        throw new Error('Nenhuma API de vídeo configurada');
      }
    } catch (error) {
      console.error('Erro na geração primária, tentando fallback...', error);
      return await this.generateFallbackVideo(options);
    }
  }

  // ============================================
  // 1. GOOGLE VEO 3 (Melhor Qualidade Geral)
  // ============================================
  async generateWithVeo3(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('🎨 Gerando com Google Veo 3...');
    
    try {
      const prompt = this.enhancePromptForVideo(options.script, options.style || 'cinematic');
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning',
        {
          instances: [{
            prompt: prompt
          }],
          parameters: {
            aspectRatio: options.aspectRatio || '16:9',
            negativePrompt: 'low quality, blurry, distorted, amateur',
            duration: Math.min(options.duration || 10, 30) // Max 30s
          }
        },
        {
          headers: {
            'x-goog-api-key': process.env.GOOGLE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      // Poll para resultado (Veo é assíncrono)
      const operationName = response.data.name;
      const videoUrl = await this.pollVeo3Operation(operationName);
      
      // Gerar thumbnail
      const thumbnailUrl = await this.generateThumbnail(videoUrl);

      console.log('✅ Vídeo gerado com Veo 3!');
      
      return {
        videoUrl,
        thumbnailUrl,
        duration: options.duration || 10,
        format: 'mp4',
        provider: 'veo3'
      };
    } catch (error) {
      console.error('Erro no Veo 3:', error);
      throw error;
    }
  }

  private async pollVeo3Operation(operationName: string): Promise<string> {
    let isDone = false;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutos max
    
    while (!isDone && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s
      
      const statusResponse = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
        {
          headers: {
            'x-goog-api-key': process.env.GOOGLE_API_KEY
          }
        }
      );

      isDone = statusResponse.data.done;
      
      if (isDone) {
        return statusResponse.data.response.generatedVideos[0].video.uri;
      }
      
      attempts++;
    }
    
    throw new Error('Timeout na geração do vídeo');
  }

  // ============================================
  // 2. RUNWAY GEN-4 (Melhor para Cinematic)
  // ============================================
  async generateWithRunway(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('🎬 Gerando com Runway Gen-4...');
    
    try {
      // Primeiro gerar imagem base
      const imageUrl = await imageGenerationService.generateImage({
        prompt: options.script,
        style: 'realistic',
        aspectRatio: options.aspectRatio || '16:9',
      });

      // Animar com Runway
      const response = await axios.post(
        'https://api.runwayml.com/v1/image_to_video',
        {
          model: 'gen4',
          image_url: imageUrl,
          duration: Math.min(options.duration || 10, 10), // Max 10s
          motion: options.style === 'calm' ? 'low' : 'high',
          camera_motion: this.getCameraMotion(options.style || 'cinematic')
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const taskId = response.data.id;
      const videoUrl = await this.pollRunwayTask(taskId);

      console.log('✅ Vídeo gerado com Runway!');
      
      return {
        videoUrl,
        thumbnailUrl: imageUrl,
        duration: options.duration || 10,
        format: 'mp4',
        provider: 'runway'
      };
    } catch (error) {
      console.error('Erro no Runway:', error);
      throw error;
    }
  }

  private async pollRunwayTask(taskId: string): Promise<string> {
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 60;
    
    while (status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await axios.get(
        `https://api.runwayml.com/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`
          }
        }
      );

      status = response.data.status;
      
      if (status === 'succeeded') {
        return response.data.output[0];
      }
      
      attempts++;
    }
    
    throw new Error('Timeout na geração Runway');
  }

  // ============================================
  // 3. KLING AI (Melhor Física e Movimento)
  // ============================================
  async generateWithKling(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('🎭 Gerando com Kling AI...');
    
    if (!replicate) {
      throw new Error('Replicate não configurado');
    }

    try {
      const prompt = this.enhancePromptForVideo(options.script, options.style || 'professional');
      
      const output = await replicate.run(
        "fofr/kling-1.5:latest", // Modelo mais recente
        {
          input: {
            prompt: prompt,
            duration: Math.min(options.duration || 10, 10),
            aspect_ratio: options.aspectRatio || '16:9',
            creativity: 0.7,
            cfg_scale: 0.5
          }
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;
      const thumbnailUrl = await this.generateThumbnail(videoUrl as string);

      console.log('✅ Vídeo gerado com Kling!');
      
      return {
        videoUrl: videoUrl as string,
        thumbnailUrl,
        duration: options.duration || 10,
        format: 'mp4',
        provider: 'kling'
      };
    } catch (error) {
      console.error('Erro no Kling:', error);
      throw error;
    }
  }

  // ============================================
  // 4. LUMA DREAM MACHINE (Fallback Rápido)
  // ============================================
  async generateWithLuma(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('💫 Gerando com Luma Dream Machine...');
    
    if (!replicate) {
      throw new Error('Replicate não configurado');
    }

    try {
      const output = await replicate.run(
        "lucataco/luma-photon:latest",
        {
          input: {
            prompt: options.script,
            aspect_ratio: options.aspectRatio || '16:9',
          }
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;
      const thumbnailUrl = await this.generateThumbnail(videoUrl as string);

      console.log('✅ Vídeo gerado com Luma!');
      
      return {
        videoUrl: videoUrl as string,
        thumbnailUrl,
        duration: 5,
        format: 'mp4',
        provider: 'luma'
      };
    } catch (error) {
      console.error('Erro no Luma:', error);
      throw error;
    }
  }

  // ============================================
  // VOICEOVER com ElevenLabs
  // ============================================
  async addVoiceover(videoUrl: string, script: string, voiceGender: 'male' | 'female'): Promise<string> {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs não configurado, pulando voiceover');
      return videoUrl;
    }

    try {
      console.log('🎙️ Adicionando voiceover...');
      
      const voiceId = voiceGender === 'male' 
        ? 'pNInz6obpgDQGcFmaJgB' // Adam voice
        : '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: script,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      // TODO: Combinar áudio com vídeo usando FFmpeg
      // Por agora retorna vídeo original
      console.log('✅ Voiceover gerado!');
      return videoUrl;
    } catch (error) {
      console.error('Erro no voiceover:', error);
      return videoUrl;
    }
  }

  // ============================================
  // FALLBACK - Animação de Imagem
  // ============================================
  async generateFallbackVideo(options: VideoGenerationOptions): Promise<VideoResult> {
    console.log('⚠️ Usando método fallback (animação de imagem)...');
    
    try {
      // Gerar imagem de alta qualidade
      const imageUrl = await imageGenerationService.generateImage({
        prompt: options.script,
        style: 'realistic',
        aspectRatio: options.aspectRatio || '16:9',
        quality: 'hd'
      });

      if (!replicate) {
        // Se nem Replicate tiver, retorna imagem estática
        return {
          videoUrl: imageUrl,
          thumbnailUrl: imageUrl,
          duration: 0,
          format: 'image',
          provider: 'fallback'
        };
      }

      // Animar com Stable Video Diffusion
      const output = await replicate.run(
        'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        {
          input: {
            input_image: imageUrl,
            sizing_strategy: 'maintain_aspect_ratio',
            frames_per_second: 24,
            motion_bucket_id: 127,
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;

      return {
        videoUrl: videoUrl as string,
        thumbnailUrl: imageUrl,
        duration: 3,
        format: 'mp4',
        provider: 'stable-video'
      };
    } catch (error) {
      console.error('Erro no fallback:', error);
      throw new Error('Não foi possível gerar vídeo com nenhum método');
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================
  
  private enhancePromptForVideo(prompt: string, style: string): string {
    const styleModifiers = {
      cinematic: 'cinematic lighting, professional camera work, film grain, depth of field, dramatic composition',
      professional: 'professional quality, clean aesthetic, corporate style, modern look',
      dynamic: 'dynamic movement, energetic pacing, vibrant colors, fast transitions',
      calm: 'smooth motion, peaceful atmosphere, soft lighting, gentle movements'
    };

    const modifier = styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.professional;
    return `${prompt}. ${modifier}. High quality video, 1080p, realistic.`;
  }

  private getCameraMotion(style: string): string {
    const motions: Record<string, string> = {
      cinematic: 'slow pan and tilt',
      professional: 'steady cam',
      dynamic: 'dynamic tracking shot',
      calm: 'minimal movement'
    };
    return motions[style] || 'steady cam';
  }

  private async generateThumbnail(videoUrl: string): Promise<string> {
    // TODO: Extrair primeiro frame do vídeo
    // Por agora retorna a URL do vídeo
    return videoUrl;
  }

  // ============================================
  // MÉTODO SIMPLIFICADO PARA REELS
  // ============================================
  async generateReel(script: string): Promise<VideoResult> {
    return await this.generateProfessionalVideo({
      script,
      duration: 15,
      style: 'dynamic',
      aspectRatio: '9:16',
      quality: 'high'
    });
  }
}

export const videoGenerationService = new VideoGenerationService();