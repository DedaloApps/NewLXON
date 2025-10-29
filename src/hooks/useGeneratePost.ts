// 🔧 SOLUÇÃO: Hook useGeneratePost com reset automático
// src/hooks/useGeneratePost.ts
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Idea {
  title: string;
  type: string;
  value: string;
  difficulty: string;
  targetPillar?: string;
}

interface BusinessContext {
  niche: string;
  audience?: string;
  tone: string;
}

interface GeneratedPost {
  id: string;
  type: string;
  mediaType: string;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  estimatedEngagement: string;
  bestTimeToPost: string;
  qualityScore: number;
  targetAudience: string;
  createdAt: Date;
}

interface UseGeneratePostReturn {
  generating: boolean;
  progress: number;
  currentStep: string;
  generatedPost: GeneratedPost | null;
  error: string | null;
  generatePost: (idea: Idea, businessContext: BusinessContext) => Promise<void>;
  reset: () => void;
}

export function useGeneratePost(): UseGeneratePostReturn {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePost = async (idea: Idea, businessContext: BusinessContext) => {
    // 🆕 RESET AUTOMÁTICO antes de começar nova geração
    // Isto garante que posts antigos não aparecem
    setGeneratedPost(null);
    setError(null);
    
    let progressTimeout: NodeJS.Timeout | undefined;

    try {
      setGenerating(true);
      setProgress(0);

      // Simulação de progresso enquanto a API processa
      const progressSteps = [
        { progress: 10, step: "A analisar a ideia...", delay: 200 },
        { progress: 25, step: "A criar caption viral...", delay: 2000 },
        { progress: 50, step: "A gerar hashtags estratégicas...", delay: 1000 },
        { progress: 70, step: idea.type === "reel" ? "A criar vídeo..." : "A gerar imagem profissional...", delay: 3000 },
        { progress: 90, step: "A guardar permanentemente...", delay: 1500 },
        { progress: 95, step: "Quase pronto...", delay: 500 },
      ];

      // Iniciar simulação de progresso
      const updateProgress = (index: number) => {
        if (index < progressSteps.length) {
          const step = progressSteps[index];
          setProgress(step.progress);
          setCurrentStep(step.step);
          
          progressTimeout = setTimeout(() => {
            updateProgress(index + 1);
          }, step.delay);
        }
      };

      updateProgress(0);

      // Chamar API
      const response = await axios.post("/api/content/generate-from-idea", {
        idea,
        businessContext,
      });

      // Parar simulação de progresso
      if (progressTimeout) {
        clearTimeout(progressTimeout);
      }

      if (response.data.success) {
        setProgress(100);
        setCurrentStep("Post gerado com sucesso! 🎉");
        setGeneratedPost(response.data.post);
        
        // Reset após 2 segundos
        setTimeout(() => {
          setGenerating(false);
        }, 2000);
      } else {
        throw new Error(response.data.error || "Erro ao gerar post");
      }

    } catch (err: any) {
      console.error("Erro ao gerar post:", err);
      
      // Limpar timeout em caso de erro também
      if (progressTimeout) {
        clearTimeout(progressTimeout);
      }
      
      const errorMessage = err.response?.data?.details 
        || err.response?.data?.error 
        || err.message 
        || "Erro desconhecido ao gerar post";
      
      setError(errorMessage);
      setGenerating(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  const reset = () => {
    setGenerating(false);
    setProgress(0);
    setCurrentStep("");
    setGeneratedPost(null);
    setError(null);
  };

  return {
    generating,
    progress,
    currentStep,
    generatedPost,
    error,
    generatePost,
    reset,
  };
}

// ========================================
// 🔧 SOLUÇÃO: Componente do Modal com reset ao abrir
// ========================================

/*
ONDE ESTIVER O GeneratePostModal (provavelmente no dashboard/page.tsx),
adiciona um useEffect para fazer reset quando o modal abre:

import { useEffect } from "react";

// No teu componente que usa o modal:
const { generatePost, reset, ...rest } = useGeneratePost();

// 🆕 ADICIONA ISTO: Reset quando modal abre
useEffect(() => {
  if (generateModalOpen) {
    reset(); // Limpa o post anterior quando abre
  }
}, [generateModalOpen, reset]);

// Ou diretamente no handler que abre o modal:
const handleOpenGenerateModal = (idea: Idea) => {
  reset(); // 🆕 Limpa antes de abrir
  setSelectedIdea(idea);
  setGenerateModalOpen(true);
};
*/