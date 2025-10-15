// src/services/media/image-generation.service.ts
import OpenAI from "openai";
import Replicate from "replicate";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = process.env.REPLICATE_API_KEY
  ? new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    })
  : null;

interface ImageGenerationOptions {
  prompt: string;
  style?:
    | "realistic"
    | "illustration"
    | "minimalist"
    | "vibrant"
    | "professional";
  aspectRatio?: "1:1" | "4:5" | "16:9" | "9:16";
  quality?: "standard" | "hd";
}

export class ImageGenerationService {
  // 🆕 FLUX Pro Ultra - MODO FOTOREALISMO MÁXIMO
  // 🆕 FLUX Pro Ultra - MODO FOTOREALISMO MÁXIMO
async generateWithFLUX(options: ImageGenerationOptions): Promise<string> {
  if (!replicate) {
    throw new Error('REPLICATE_API_KEY não configurado');
  }

  try {
    const { prompt, aspectRatio = '1:1' } = options;

    // 🔥 ADICIONAR IMPERFEIÇÕES NATURAIS AO PROMPT
    const hyperRealisticPrompt = this.addPhotorealismEnhancers(prompt);

    console.log(`📸 FLUX Pro Ultra (FOTOREALISMO): "${hyperRealisticPrompt.substring(0, 120)}..."`);
    console.log(`📐 Aspect Ratio: ${aspectRatio}`);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro-ultra",
      {
        input: {
          prompt: hyperRealisticPrompt,
          aspect_ratio: aspectRatio,
          output_format: "jpg",
          safety_tolerance: 2,
          raw: true,
        }
      }
    );

    console.log('🔍 FLUX Output type:', typeof output);

    // 🔧 PROCESSAR OUTPUT DE FORMA ROBUSTA
    let imageUrl: string | null = null;

    // Caso 1: Array
    if (Array.isArray(output)) {
      console.log('📦 Output é Array');
      imageUrl = output[0];
    } 
    // Caso 2: String direta
    else if (typeof output === 'string') {
      console.log('📝 Output é String');
      imageUrl = output;
    } 
    // Caso 3: Objeto (FileOutput do Replicate)
    else if (output && typeof output === 'object') {
      console.log('📦 Output é Objeto FileOutput');
      const outputObj = output as any;
      
      // 🆕 VERIFICAR SE TEM MÉTODO url()
      if (typeof outputObj.url === 'function') {
        console.log('🔧 Chamando método url()...');
        imageUrl = outputObj.url(); // ✅ CHAMAR A FUNÇÃO
      }
      // Ou se é propriedade
      else if (outputObj.url && typeof outputObj.url === 'string') {
        imageUrl = outputObj.url;
      } 
      // Outras propriedades possíveis
      else if (outputObj.publicUrl) {
        imageUrl = outputObj.publicUrl;
      } else if (outputObj.downloadUrl) {
        imageUrl = outputObj.downloadUrl;
      } else if (outputObj.href) {
        imageUrl = outputObj.href;
      }
      // toString como último recurso
      else if (outputObj.toString && typeof outputObj.toString === 'function') {
        const stringified = outputObj.toString();
        if (stringified !== '[object Object]' && stringified.includes('http')) {
          imageUrl = stringified;
        }
      }
    }

    // Validar resultado final
    if (!imageUrl) {
      console.error('❌ Não foi possível extrair URL do output');
      console.error('Output keys:', output ? Object.keys(output) : 'null');
      throw new Error('FLUX não retornou uma URL válida');
    }

    // Converter para string se não for
    imageUrl = String(imageUrl);

    // Validar que é uma URL HTTP/HTTPS
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw new Error(`URL inválida retornada pelo FLUX: ${imageUrl}`);
    }

    console.log(`✅ FLUX Pro Ultra: Fotografia hiper-realista gerada`);
    console.log(`🔗 URL final: ${imageUrl.substring(0, 80)}...`);
    
    return imageUrl;
  } catch (error: any) {
    console.error('❌ Erro ao gerar imagem com FLUX:', error.message);
    throw error;
  }
}

  // 🆕 ADICIONAR IMPERFEIÇÕES NATURAIS E FOTOREALISMO
  private addPhotorealismEnhancers(prompt: string): string {
    // Elementos de fotografia real
    const photoRealism = [
      "shot on Canon EOS R5",
      "natural skin texture",
      "subtle film grain",
      "real photography",
      "authentic moment",
      "natural lighting imperfections",
      "slight lens distortion",
      "organic composition",
      "real-world setting",
      "natural wear and tear",
      "lived-in environment",
      "candid shot",
      "unposed",
      "raw photography",
      "documentary style",
    ];

    // Detalhes técnicos fotográficos
    const technicalDetails = [
      "ISO 400",
      "f/2.8",
      "50mm lens",
      "natural depth of field",
      "subtle motion blur",
      "real camera sensor noise",
      "authentic color temperature",
      "natural shadows",
      "organic highlights",
      "practical lighting",
    ];

    // 🔥 NEGATIVE PROMPTS ULTRA-AGRESSIVOS
    const negativePrompts = [
      "AI generated",
      "artificial",
      "CGI",
      "digital art",
      "3D render",
      "illustration",
      "cartoon",
      "painting",
      "drawing",
      "anime",
      "perfect symmetry",
      "flawless",
      "too clean",
      "sterile",
      "fake",
      "synthetic",
      "computer generated",
      "unnatural",
      "overly smooth",
      "plastic",
      "glossy",
      "airbrushed",
      "filtered",
      "photoshopped",
      "unrealistic lighting",
      "studio perfect",
    ];

    // Selecionar aleatoriamente alguns enhancers
    const selectedPhoto = this.getRandomElements(photoRealism, 4);
    const selectedTech = this.getRandomElements(technicalDetails, 3);

    // Construir prompt final
    const enhancedPrompt = `${prompt}, ${selectedPhoto.join(
      ", "
    )}, ${selectedTech.join(", ")}`;
    const negativeString = negativePrompts.join(", ");

    return `${enhancedPrompt}. NEGATIVE PROMPT: ${negativeString}`;
  }

  // Helper para selecionar elementos aleatórios
  private getRandomElements(array: string[], count: number): string[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // DALL-E 3 como FALLBACK apenas
  async generateWithDALLE(options: ImageGenerationOptions): Promise<string> {
    try {
      const { prompt, style = "professional", quality = "hd" } = options;
      const enhancedPrompt = this.enhancePrompt(prompt, style);

      console.log(
        `🎨 DALL-E 3 (FALLBACK): "${enhancedPrompt.substring(0, 80)}..."`
      );

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: quality,
        style: "natural", // Sempre natural para menos processamento
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("Nenhuma imagem foi gerada");
      }

      const imageUrl = response.data[0].url;

      if (!imageUrl) {
        throw new Error("URL da imagem não encontrada");
      }

      console.log(`✅ DALL-E 3: Imagem gerada (fallback)`);
      return imageUrl;
    } catch (error) {
      console.error("Erro ao gerar imagem com DALL-E:", error);
      throw error;
    }
  }

  // 🔥 NOVA LÓGICA: SEMPRE TENTAR FLUX PRIMEIRO
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    try {
      console.log(
        `🎨 Gerando imagem FOTOREALISTA: ${options.style} para ${
          options.aspectRatio || "1:1"
        }`
      );

      // 🆕 PRIORIDADE ABSOLUTA: FLUX Pro Ultra
      if (replicate) {
        try {
          console.log("🎯 Usando FLUX Pro Ultra (fotorealismo máximo)...");
          return await this.generateWithFLUX(options);
        } catch (error: any) {
          console.warn("⚠️ FLUX falhou:", error.message);
          console.log("🔄 Tentando DALL-E como fallback...");
        }
      }

      // Fallback para DALL-E se FLUX não disponível
      if (process.env.OPENAI_API_KEY) {
        return await this.generateWithDALLE(options);
      }

      throw new Error("Nenhuma API de geração de imagens disponível");
    } catch (error) {
      console.error("❌ Erro ao gerar imagem:", error);
      return this.getPlaceholderImage(options.aspectRatio || "1:1");
    }
  }

  // Melhorar prompt baseado no estilo (para DALL-E fallback)
  private enhancePrompt(prompt: string, style: string): string {
    const styleModifiers = {
      realistic:
        "raw photography, natural lighting, authentic, real photograph, unfiltered",
      illustration:
        "digital illustration, modern design, clean lines, vector art style",
      minimalist:
        "minimalist design, simple, clean, modern, flat design, geometric shapes",
      vibrant:
        "vibrant colors, energetic, dynamic, bold, eye-catching, modern aesthetic",
      professional:
        "professional photography, natural setting, authentic moment, real photograph",
    };

    const modifier =
      styleModifiers[style as keyof typeof styleModifiers] ||
      styleModifiers.professional;
    return `${prompt}, ${modifier}`;
  }

  // Placeholder image caso tudo falhe
  private getPlaceholderImage(aspectRatio: string): string {
    const dimensions: Record<string, string> = {
      "1:1": "1080x1080",
      "4:5": "1080x1350",
      "16:9": "1920x1080",
      "9:16": "1080x1920",
    };

    const size = dimensions[aspectRatio] || "1080x1080";
    return `https://via.placeholder.com/${size}/3B82F6/FFFFFF?text=Imagem+Gerada+por+IA`;
  }

  // Gerar múltiplas imagens para carrossel
  async generateCarouselImages(
    slides: Array<{ title: string; imagePrompt: string }>
  ): Promise<Array<{ slideIndex: number; imageUrl: string }>> {
    console.log(
      `🎨 Gerando ${slides.length} imagens FOTOREALISTAS para carrossel...`
    );
    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`Gerando slide ${i + 1}/${slides.length}...`);

      try {
        const imageUrl = await this.generateImage({
          prompt: slide.imagePrompt,
          style: "realistic", // Força fotorealismo
          aspectRatio: "1:1",
        });

        results.push({
          slideIndex: i + 1,
          imageUrl,
        });

        if (i < slides.length - 1) {
          console.log("⏳ Aguardando 3s para próxima imagem...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Erro ao gerar slide ${i + 1}:`, error);
        results.push({
          slideIndex: i + 1,
          imageUrl: this.getPlaceholderImage("1:1"),
        });
      }
    }

    console.log(
      `✅ ${results.length} imagens fotorealistas de carrossel geradas`
    );
    return results;
  }

  async optimizeForInstagram(imageUrl: string): Promise<string> {
    return imageUrl;
  }
}

export const imageGenerationService = new ImageGenerationService();
