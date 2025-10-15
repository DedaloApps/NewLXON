// src/services/media/runway-video.service.ts
import Replicate from "replicate";

// 🆕 USAR REPLICATE_API_KEY (não RUNWAY_API_KEY)
const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    })
  : null;

interface RunwayVideoOptions {
  prompt: string;
  duration?: 5 | 10 | 15;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  seed?: number;
}

interface RunwayVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  model: string;
  cost: number;
}

export class RunwayVideoService {
  // 🆕 Modelos disponíveis via Replicate
  private readonly MODELS = {
    // Runway Gen-2 (text-to-video)
    gen2: {
      id: "fofr/runway-gen2" as const,
      costPer5s: 0.15,
      costPer10s: 0.30,
    },
    // Minimax Video (alternativa excelente)
    minimax: {
      id: "minimax/video-01" as const,
      costPer5s: 0.10,
      costPer10s: 0.20,
    },
  };

  /**
   * Gera vídeo com Runway via Replicate
   */
  async generateVideo(options: RunwayVideoOptions): Promise<RunwayVideoResult> {
    if (!replicate) {
      throw new Error("REPLICATE_API_KEY não configurado no .env");
    }

    const {
      prompt,
      duration = 10,
      aspectRatio = "9:16",
      seed,
    } = options;

    console.log("🎬 Runway via Replicate iniciando...");
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}..."`);
    console.log(`⏱️ Duração: ${duration}s`);
    console.log(`📐 Aspect Ratio: ${aspectRatio}`);

    try {
      // Usar Minimax (melhor custo-benefício)
      const modelConfig = this.MODELS.minimax;
      
      console.log(`🤖 Usando modelo: ${modelConfig.id}`);

      const output = await replicate.run(modelConfig.id, {
        input: {
          prompt: this.enhancePromptForVideo(prompt),
          prompt_optimizer: true, // Otimiza o prompt automaticamente
        },
      });

      console.log("🔍 Output type:", typeof output);

      // Processar output
      let videoUrl: string | null = null;

      if (Array.isArray(output)) {
        videoUrl = output[0];
      } else if (typeof output === "string") {
        videoUrl = output;
      } else if (output && typeof output === "object") {
        const outputObj = output as any;

        // Tentar diferentes propriedades
        if (typeof outputObj.url === "function") {
          videoUrl = outputObj.url();
        } else if (outputObj.url) {
          videoUrl = outputObj.url;
        } else if (outputObj.video) {
          videoUrl = outputObj.video;
        } else if (outputObj.video_url) {
          videoUrl = outputObj.video_url;
        }
      }

      if (!videoUrl) {
        console.error("❌ Output completo:", output);
        throw new Error("Não foi possível extrair URL do vídeo");
      }

      videoUrl = String(videoUrl);

      // Validar URL
      if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
        throw new Error(`URL inválida: ${videoUrl}`);
      }

      // Calcular custo
      const cost = duration <= 5 ? modelConfig.costPer5s : modelConfig.costPer10s;

      // Gerar thumbnail
      const thumbnailUrl = this.generateThumbnailUrl(videoUrl);

      console.log("✅ Vídeo gerado com sucesso!");
      console.log(`🔗 URL: ${videoUrl.substring(0, 80)}...`);
      console.log(`💰 Custo: $${cost.toFixed(2)}`);

      return {
        videoUrl,
        thumbnailUrl,
        duration,
        model: "minimax",
        cost,
      };
    } catch (error: any) {
      console.error("❌ Erro ao gerar vídeo:", error.message);
      
      // Log detalhado para debug
      if (error.response) {
        console.error("Response:", error.response.data);
      }
      
      throw error;
    }
  }

  /**
   * Gera vídeo para Reel (formato otimizado)
   */
  async generateReelVideo(options: {
    script: string;
    duration?: 10 | 15;
    context?: any;
  }): Promise<RunwayVideoResult> {
    const prompt = this.createReelPrompt(options.script, options.context);

    return this.generateVideo({
      prompt,
      duration: options.duration || 10,
      aspectRatio: "9:16",
    });
  }

  /**
   * Cria prompt otimizado para Reel
   */
  private createReelPrompt(script: string, context?: any): string {
    const keywords = this.extractKeywords(script);

    const basePrompt = `Vertical video for social media showing ${keywords.join(", ")}`;

    const enhancers = [
      "professional quality",
      "smooth camera work",
      "modern aesthetic",
      "vibrant colors",
      "engaging visuals",
      "9:16 vertical format",
      "high energy",
      "dynamic movement",
    ];

    return `${basePrompt}, ${enhancers.slice(0, 4).join(", ")}`;
  }

  /**
   * Melhora prompt para vídeo
   */
  private enhancePromptForVideo(prompt: string): string {
    const enhancers = [
      "cinematic",
      "professional video",
      "smooth motion",
      "high quality",
      "engaging visuals",
      "modern aesthetic",
    ];

    const selected = this.selectRandom(enhancers, 3);
    return `${prompt}, ${selected.join(", ")}`;
  }

  /**
   * Extrai keywords do script
   */
  private extractKeywords(script: string): string[] {
    const stopWords = ["o", "a", "de", "da", "do", "em", "para", "com", "que", "um", "uma", "the", "and", "or", "but"];

    const words = script
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.includes(word));

    return words.slice(0, 5);
  }

  /**
   * Gera URL de thumbnail
   */
  private generateThumbnailUrl(videoUrl: string): string {
    // Tentar extrair thumbnail da URL do vídeo
    // Por agora, placeholder
    return `https://via.placeholder.com/1080x1920/3B82F6/FFFFFF?text=Video+Reel`;
  }

  /**
   * Helper: selecionar aleatórios
   */
  private selectRandom(array: string[], count: number): string[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Verifica se está configurado
   */
  isConfigured(): boolean {
    return !!replicate && !!process.env.REPLICATE_API_KEY;
  }
}

export const runwayVideoService = new RunwayVideoService();