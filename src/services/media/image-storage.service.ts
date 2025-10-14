// src/services/media/image-storage.service.ts
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface UploadResult {
  publicUrl: string;
  path: string;
  bucket: string;
}

export class ImageStorageService {
  private readonly BUCKET_NAME = 'content-images';

  /**
   * Faz download de uma imagem temporária e guarda permanentemente no Supabase
   */
  async saveImagePermanently(
    temporaryUrl: string,
    userId: string,
    filename?: string
  ): Promise<UploadResult> {
    try {
      console.log(`💾 A guardar imagem permanentemente: ${temporaryUrl}`);

      // 1. Fazer download da imagem temporária
      const response = await axios.get(temporaryUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/png';
      
      // 2. Gerar nome único para o ficheiro
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const extension = contentType.split('/')[1] || 'png';
      const fileName = filename || `${timestamp}-${randomStr}.${extension}`;
      const filePath = `${userId}/${fileName}`;

      // 3. Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType,
          upsert: false,
          cacheControl: '31536000', // 1 ano
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        throw new Error(`Falha no upload: ${error.message}`);
      }

      // 4. Obter URL pública permanente
      const { data: publicData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log(`✅ Imagem guardada: ${publicData.publicUrl}`);

      return {
        publicUrl: publicData.publicUrl,
        path: filePath,
        bucket: this.BUCKET_NAME,
      };
    } catch (error: any) {
      console.error('Erro ao guardar imagem:', error);
      
      // Se falhar, retornar a URL original (fallback)
      return {
        publicUrl: temporaryUrl,
        path: '',
        bucket: this.BUCKET_NAME,
      };
    }
  }

  /**
   * Processa múltiplas imagens em batch
   */
  async saveMultipleImages(
    images: Array<{ url: string; name?: string }>,
    userId: string
  ): Promise<UploadResult[]> {
    console.log(`💾 A guardar ${images.length} imagens...`);

    const results = await Promise.allSettled(
      images.map((img, index) =>
        this.saveImagePermanently(
          img.url,
          userId,
          img.name || `image-${index}`
        )
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Erro ao guardar imagem ${index}:`, result.reason);
        return {
          publicUrl: images[index].url, // fallback
          path: '',
          bucket: this.BUCKET_NAME,
        };
      }
    });
  }

  /**
   * Deleta uma imagem do storage
   */
  async deleteImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  /**
   * Verifica se um bucket existe, se não cria
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('📦 A criar bucket content-images...');
        const { data, error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        });

        if (error) {
          console.error('Erro ao criar bucket:', error);
        } else {
          console.log('✅ Bucket content-images criado com sucesso!');
        }
      } else {
        console.log('✅ Bucket content-images já existe');
      }
    } catch (error) {
      console.error('Erro ao verificar/criar bucket:', error);
    }
  }

  /**
   * Lista todas as imagens de um utilizador
   */
  async listUserImages(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (error) throw error;

      return data?.map(file => {
        const { data: publicData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${userId}/${file.name}`);
        return publicData.publicUrl;
      }) || [];
    } catch (error) {
      console.error('Erro ao listar imagens:', error);
      return [];
    }
  }

  /**
   * Limpa imagens antigas de um utilizador (opcional)
   */
  async cleanupOldImages(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (error) throw error;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldFiles = data?.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      }) || [];

      if (oldFiles.length === 0) {
        console.log('Nenhuma imagem antiga para limpar');
        return 0;
      }

      const filePaths = oldFiles.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) throw deleteError;

      console.log(`🗑️ ${oldFiles.length} imagens antigas removidas`);
      return oldFiles.length;
    } catch (error) {
      console.error('Erro ao limpar imagens antigas:', error);
      return 0;
    }
  }
}

export const imageStorageService = new ImageStorageService();