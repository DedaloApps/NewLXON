// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Copy,
  ExternalLink,
  Loader2,
  Instagram,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InstagramReport } from "@/components/features/instagram-report";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Celebrar se acabou de completar onboarding
    if (searchParams.get("onboarding") === "completed") {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }

    fetchOnboardingData();
  }, [searchParams]);

  const fetchOnboardingData = async () => {
    try {
      const response = await axios.get("/api/onboarding/process");
      
      if (!response.data.hasOnboarding) {
        router.push("/onboarding");
        return;
      }

      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Não foi possível carregar os dados.</p>
            <Button onClick={() => router.push("/onboarding")}>
              Fazer Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strategy = data.strategy;
  const initialPosts = data.initialPosts;
  const contentIdeas = data.contentIdeas;
  const profileAnalysis = data.profileAnalysis;
  const weeklyCalendar = data.weeklyCalendar;
  
  // Dados do novo formato
  const businessInfo = {
    business: data.business,
    businessDescription: data.businessDescription,
    audience: data.audience,
    objective: data.objective,
  };
  
  const platforms = ["Instagram"]; // Default por agora
  const instagramReport = data.instagramReport;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showConfetti && (
            <div className="mb-4 p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">🎉 Estratégia criada com sucesso!</h3>
                  <p className="text-sm text-white/90">
                    Os agentes de IA analisaram tudo e criaram um plano completo para ti
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">A Tua Estratégia de Conteúdo</h1>
              <p className="text-white/90">
                Negócio: <span className="font-semibold">{businessInfo.businessDescription}</span>
              </p>
              <p className="text-white/90 text-sm mt-1">
                Público: <span className="font-semibold">{businessInfo.audience}</span> | 
                Objetivo: <span className="font-semibold">{businessInfo.objective}</span>
              </p>
              <div className="flex gap-2 mt-3">
                {platforms.map((platform: string) => (
                  <Badge key={platform} className="bg-white/20 text-white border-0">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              Criar Novo Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram Report */}
        {instagramReport && <InstagramReport report={instagramReport} />}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posts Prontos</p>
                  <p className="text-2xl font-bold">{initialPosts.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ideias Geradas</p>
                  <p className="text-2xl font-bold">{contentIdeas.length}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Objetivo Mensal</p>
                  <p className="text-2xl font-bold">
                    +{strategy.monthlyGoals.followers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement Meta</p>
                  <p className="text-2xl font-bold">{strategy.monthlyGoals.engagement}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Prontos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Posts Prontos para Publicar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialPosts.map((post: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  {/* Imagem do Post */}
                  {post.imageUrl && (
                    <div className="relative h-64 bg-gray-100">
                      <img
                        src={post.imageUrl}
                        alt={post.hook}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          className={
                            post.type === "educational"
                              ? "bg-blue-600"
                              : post.type === "viral"
                              ? "bg-purple-600"
                              : "bg-green-600"
                          }
                        >
                          {post.type === "educational"
                            ? "📚 Educativo"
                            : post.type === "viral"
                            ? "🔥 Viral"
                            : "💰 Vendas"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {!post.imageUrl && (
                          <Badge
                            className={
                              post.type === "educational"
                                ? "bg-blue-100 text-blue-700"
                                : post.type === "viral"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }
                          >
                            {post.type === "educational"
                              ? "📚 Educativo"
                              : post.type === "viral"
                              ? "🔥 Viral"
                              : "💰 Vendas"}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {post.bestTimeToPost}
                        </Badge>
                      </div>
                      <Button size="sm">Publicar Agora</Button>
                    </div>

                    <h3 className="font-bold text-lg mb-2">{post.hook}</h3>
                    <p className="text-gray-700 mb-3 line-clamp-3">{post.caption}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.hashtags.slice(0, 5).map((tag: string, i: number) => (
                        <span key={i} className="text-sm text-blue-600">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        CTA: {post.cta}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Engagement: {post.estimatedEngagement}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pilares de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Pilares de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.contentPillars.map((pillar: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{pillar.name}</h3>
                      <Badge>{pillar.percentage}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pillar.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.examples.map((example: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mix de Formatos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mix de Formatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(strategy.formatMix).map(([format, percentage]: any) => (
                  <div key={format}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{format}</span>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold mb-2">📅 Melhores Horários</h4>
                <div className="flex flex-wrap gap-2">
                  {strategy.postingSchedule.bestTimes.map((time: string) => (
                    <Badge key={time} className="bg-blue-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {strategy.postingSchedule.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ideias de Conteúdo */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                10 Ideias de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentIdeas.map((idea: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {idea.type}
                      </Badge>
                      <Badge
                        className={
                          idea.difficulty === "easy"
                            ? "bg-green-100 text-green-700"
                            : idea.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {idea.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-bold mb-2">{idea.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{idea.value}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>⏱️ {idea.estimatedTime}</span>
                      <Button size="sm" variant="outline">
                        Gerar Agora
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}