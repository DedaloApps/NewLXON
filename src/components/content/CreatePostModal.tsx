// src/components/content/CreatePostModal.tsx
"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Sparkles, Loader2, CheckCircle, Image as ImageIcon, Wand2 } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessContext?: {
    niche: string;
    audience?: string;
    tone: string;
  };
  onPostCreated?: () => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
  businessContext,
  onPostCreated,
}: CreatePostModalProps) {
  const [step, setStep] = useState<"upload" | "generate" | "success">("upload");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Campos do post
  const [postType, setPostType] = useState<string>("educational");
  const [topic, setTopic] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
  // Post gerado
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de ficheiro
      if (!file.type.startsWith("image/")) {
        alert("Por favor, seleciona uma imagem válida");
        return;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("A imagem é muito grande. Máximo 10MB");
        return;
      }

      setUploadedImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert("Por favor, faz upload de uma imagem");
      return;
    }

    setGenerating(true);
    setStep("generate");
    setProgress(0);

    // Simulação de progresso
    const progressSteps = [
      { progress: 10, message: "A fazer upload da imagem...", delay: 500 },
      { progress: 30, message: "A analisar conteúdo da imagem...", delay: 1500 },
      { progress: 50, message: "A IA está a criar a caption perfeita...", delay: 2000 },
      { progress: 70, message: "A gerar hashtags estratégicas...", delay: 1500 },
      { progress: 90, message: "A guardar permanentemente...", delay: 1000 },
      { progress: 95, message: "Quase pronto...", delay: 500 },
    ];

    let progressInterval: NodeJS.Timeout | undefined;
    const updateProgress = (index: number) => {
      if (index < progressSteps.length) {
        const step = progressSteps[index];
        setProgress(step.progress);
        setCurrentMessage(step.message);
        
        progressInterval = setTimeout(() => {
          updateProgress(index + 1);
        }, step.delay);
      }
    };

    updateProgress(0);

    try {
      // Preparar FormData
      const formData = new FormData();
      formData.append("image", uploadedImage);
      formData.append("postType", postType);
      formData.append("topic", topic || "Post sobre o meu negócio");
      formData.append("customInstructions", customInstructions);
      
      if (businessContext) {
        formData.append("niche", businessContext.niche);
        formData.append("audience", businessContext.audience || "");
        formData.append("tone", businessContext.tone);
      }

      // Chamar API
      const response = await axios.post("/api/content/create-with-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (progressInterval) {
        clearTimeout(progressInterval);
      }

      if (response.data.success) {
        setProgress(100);
        setCurrentMessage("Post criado com sucesso! 🎉");
        setGeneratedPost(response.data.post);
        setStep("success");
        
        // Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Notificar parent
        setTimeout(() => {
          onPostCreated?.();
        }, 1500);
      }
    } catch (error: any) {
      if (progressInterval) {
        clearTimeout(progressInterval);
      }
      console.error("Erro ao criar post:", error);
      alert(error.response?.data?.error || "Erro ao criar post");
      setGenerating(false);
      setStep("upload");
    }
  };

  const handleClose = () => {
    setStep("upload");
    setUploadedImage(null);
    setImagePreview(null);
    setGenerating(false);
    setProgress(0);
    setPostType("educational");
    setTopic("");
    setCustomInstructions("");
    setGeneratedPost(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            Criar Post Personalizado
          </DialogTitle>
          <DialogDescription>
            Faz upload da tua imagem e a IA cria a caption perfeita
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  1. Faz upload da tua imagem
                </Label>
                
                {!imagePreview ? (
                  <div
                    className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Arrasta a tua imagem aqui
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ou clica para selecionar do computador
                    </p>
                    <Badge variant="outline" className="text-xs">
                      PNG, JPG, WEBP • Máx 10MB
                    </Badge>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-96 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-3 right-3 rounded-full"
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Configurações */}
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  {/* Tipo de Post */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      2. Que tipo de post queres?
                    </Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educational">
                          📚 Educativo - Ensina algo valioso
                        </SelectItem>
                        <SelectItem value="viral">
                          🔥 Viral - Entretenimento/Relatable
                        </SelectItem>
                        <SelectItem value="sales">
                          💰 Vendas - Converte em clientes
                        </SelectItem>
                        <SelectItem value="engagement">
                          💬 Engagement - Gera conversa
                        </SelectItem>
                        <SelectItem value="behind_scenes">
                          🎬 Bastidores - Mostra o processo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tópico (Opcional) */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      3. Sobre o que é o post? (Opcional)
                    </Label>
                    <Textarea
                      placeholder="Ex: Novo produto lançado, resultado de cliente, dica do dia..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  {/* Instruções Personalizadas (Opcional) */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      4. Instruções especiais para a IA (Opcional)
                    </Label>
                    <Textarea
                      placeholder="Ex: Menciona promoção de 20%, fala sobre sustentabilidade, usa tom humorístico..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Botão Gerar */}
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full shadow-lg shadow-indigo-500/30"
                    onClick={handleGenerate}
                  >
                    <Sparkles className="w-5 h-5" />
                    Gerar Caption com IA
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: GENERATING */}
          {step === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                  <Loader2 className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                A IA está a trabalhar...
              </h3>
              <p className="text-gray-600 mb-6">{currentMessage}</p>

              {/* Barra de Progresso */}
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && generatedPost && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Post Criado com Sucesso! 🎉
                </h3>
                <p className="text-gray-600">
                  O teu post já está no Content Hub pronto para publicar
                </p>
              </div>

              {/* Preview do Post */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagem */}
                  <div>
                    <img
                      src={generatedPost.imageUrl}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Hook:</Label>
                      <p className="font-bold text-lg">{generatedPost.hook}</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Caption:</Label>
                      <p className="text-sm text-gray-700 line-clamp-4">
                        {generatedPost.caption}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Hashtags:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedPost.hashtags?.slice(0, 5).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {generatedPost.hashtags?.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{generatedPost.hashtags.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Criar Outro Post
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  onClick={() => {
                    handleClose();
                    window.location.href = "/content-hub";
                  }}
                >
                  Ver no Content Hub
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}