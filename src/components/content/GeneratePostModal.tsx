// src/components/content/GeneratePostModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGeneratePost } from "@/hooks/useGeneratePost";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Download,
  Calendar,
  TrendingUp,
  Hash,
  Target,
  Clock,
  Users,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface GeneratePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    title: string;
    type: string;
    value: string;
    difficulty: string;
    targetPillar?: string;
  } | null;
  businessContext: {
    niche: string;
    audience?: string;
    tone: string;
  };
}

export function GeneratePostModal({
  open,
  onOpenChange,
  idea,
  businessContext,
}: GeneratePostModalProps) {
  const router = useRouter();
  const { generating, progress, currentStep, generatedPost, error, generatePost, reset } = useGeneratePost();
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!idea) return;
    
    await generatePost(idea, businessContext);
    
    // Confetti quando terminar
    if (!error) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleCopyCaption = () => {
    if (generatedPost?.caption) {
      navigator.clipboard.writeText(generatedPost.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToContentHub = () => {
    handleClose();
    router.push("/content-hub");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            Gerar Post com IA
          </DialogTitle>
          <DialogDescription>
            {idea && `"${idea.title}"`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* ESTADO INICIAL */}
          {!generating && !generatedPost && !error && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  O que vais receber:
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Caption viral otimizada (125-150 palavras)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    10 hashtags estratégicas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {idea?.type === "reel" ? "Vídeo profissional gerado" : "Imagem fotorealista gerada com FLUX Pro"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Hook impactante e CTA de conversão
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Melhor horário para publicar
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
                  <Clock className="w-4 h-4" />
                  Tempo estimado: 15-30 segundos
                </div>
                <Badge variant="secondary">
                  {idea?.difficulty === "easy" ? "Fácil" : idea?.difficulty === "medium" ? "Médio" : "Difícil"}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Agora
                </Button>
              </div>
            </motion.div>
          )}

          {/* ESTADO GERANDO */}
          {generating && !generatedPost && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="flex flex-col items-center justify-center gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-blue-200"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">
                    {currentStep}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Agentes de IA a trabalhar no teu post...
                  </p>
                </div>

                <div className="w-full max-w-md space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress}%</span>
                    <span>Quase lá...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO SUCESSO */}
          {generatedPost && !error && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Success Banner */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Post gerado com sucesso! 🎉
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Score de qualidade: {generatedPost.qualityScore}/10
                  </p>
                </div>
              </div>

              {/* Preview da Media */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                {generatedPost.mediaType === "reel" && generatedPost.videoUrl ? (
                  <div className="aspect-[9/16] max-h-96 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <div className="text-center text-white">
                      <Video className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Vídeo gerado</p>
                    </div>
                  </div>
                ) : generatedPost.imageUrl ? (
                  <img
                    src={generatedPost.imageUrl}
                    alt="Post gerado"
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <Badge className="absolute top-3 right-3 bg-blue-600">
                  {generatedPost.type}
                </Badge>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Engagement</p>
                  <p className="font-semibold">{generatedPost.estimatedEngagement}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Melhor hora</p>
                  <p className="font-semibold">{generatedPost.bestTimeToPost}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                  <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Público</p>
                  <p className="font-semibold text-xs">{generatedPost.targetAudience}</p>
                </div>
              </div>

              {/* Caption Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    Caption
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCaption}
                    className="gap-2"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{generatedPost.caption}</p>
                </div>

                {/* Hashtags */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-600" />
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPost.hashtags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleGoToContentHub}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver no Content Hub
                </Button>
              </div>
            </motion.div>
          )}

          {/* ESTADO ERRO */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="p-6 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Erro ao gerar post
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}