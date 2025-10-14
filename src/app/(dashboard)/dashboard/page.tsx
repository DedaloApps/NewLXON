// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { HeaderPremium } from "@/components/layout/Header";
import {
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Loader2,
  Instagram,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  ShoppingCart,
  Image,
  Video,
  LayoutGrid,
  Hash,
  Award,
  AlertCircle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Play,
  ExternalLink,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstagramReport, setShowInstagramReport] = useState(false);
  const { data: session } = useSession();

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/instagram/report-pdf");
      const html = await response.text();

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tenta novamente.");
    }
  };

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">A carregar estratégia...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Dados não encontrados
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados.
            </p>
            <Button onClick={() => router.push("/onboarding")}>
              Fazer Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strategy = data.strategy;
  const initialPosts = data.initialPosts || [];
  const contentIdeas = data.contentIdeas || [];

  const businessInfo = {
    business: data.business,
    businessDescription: data.businessDescription,
    audience: data.audience,
    objective: data.objective,
  };

  const platforms = ["Instagram"];
  const instagramReport = data.instagramReport;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderPremium
        pageTitle="Dashboard"
        userName={session?.user?.name || "User"}
        userEmail={session?.user?.email || undefined}
        userAvatar={session?.user?.image || undefined}
        notificationCount={0}
      />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showConfetti && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    🎉 Estratégia criada com sucesso!
                  </h3>
                  <p className="text-sm text-blue-700">
                    Os agentes de IA analisaram o teu negócio e criaram{" "}
                    {initialPosts.length} posts prontos para publicar
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Negócio:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.businessDescription}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Público:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.audience}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.objective}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {platforms.map((platform: string) => (
                  <Badge key={platform} variant="outline" className="gap-1">
                    <Instagram className="w-3 h-3" />
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/content-hub")}
              >
                <Calendar className="w-4 h-4" />
                Ver Calendário
              </Button>
              <Button
                className="gap-2"
                onClick={() => router.push("/create-post")}
              >
                <Plus className="w-4 h-4" />
                Criar Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram Report - Simples */}
        {instagramReport && (
          <Card className="mb-8 overflow-hidden border-purple-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      Análise do Instagram
                    </h3>
                    <p className="text-sm text-white/80">
                      @{instagramReport.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                    PDF Completo
                  </Button>
                  <Button
                    onClick={() => setShowInstagramReport(!showInstagramReport)}
                    variant="outline"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {showInstagramReport ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver Relatório
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(
                        instagramReport.analysis.overallScore
                      )} flex items-center justify-center text-white text-3xl font-bold mb-2`}
                    >
                      {instagramReport.analysis.overallScore}
                    </div>
                    <p
                      className={`text-sm font-medium ${getScoreColor(
                        instagramReport.analysis.overallScore
                      )}`}
                    >
                      Score Geral
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {instagramReport.analysis.profileScore}
                      </p>
                      <p className="text-xs text-gray-600">Perfil / 20</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <LayoutGrid className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {instagramReport.analysis.contentScore}
                      </p>
                      <p className="text-xs text-gray-600">Conteúdo / 30</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {instagramReport.analysis.engagementScore}
                      </p>
                      <p className="text-xs text-gray-600">Engagement / 25</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Hash className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {instagramReport.analysis.hashtagScore}
                      </p>
                      <p className="text-xs text-gray-600">Hashtags / 15</p>
                    </div>
                  </div>
                </div>

                <Badge
                  className={
                    instagramReport.analysis.overallScore >= 80
                      ? "bg-green-100 text-green-700 border-green-200"
                      : instagramReport.analysis.overallScore >= 60
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }
                >
                  {instagramReport.analysis.overallScore >= 80 ? (
                    <>
                      <Award className="w-3 h-3 mr-1" />
                      Excelente
                    </>
                  ) : instagramReport.analysis.overallScore >= 60 ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Pode melhorar
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Precisa atenção
                    </>
                  )}
                </Badge>
              </div>

              {/* Problemas Críticos */}
              {instagramReport.analysis.criticalIssues &&
                instagramReport.analysis.criticalIssues.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 mb-2">
                          {instagramReport.analysis.criticalIssues.length}{" "}
                          problema(s) identificado(s)
                        </p>
                        <div className="space-y-2">
                          {instagramReport.analysis.criticalIssues
                            .slice(0, 3)
                            .map((issue: any, idx: number) => (
                              <div key={idx} className="text-sm text-amber-800">
                                • {issue.issue}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Relatório Completo - Expandível */}
              {showInstagramReport && (
                <div className="mt-6 pt-6 border-t space-y-6">
                  {/* Recomendações */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Recomendações
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Mix de Conteúdo
                        </p>
                        <div className="space-y-1 text-xs text-blue-700">
                          <div>
                            Educativo:{" "}
                            {
                              instagramReport.analysis.recommendations
                                ?.contentMix?.educational
                            }
                            %
                          </div>
                          <div>
                            Inspiracional:{" "}
                            {
                              instagramReport.analysis.recommendations
                                ?.contentMix?.inspirational
                            }
                            %
                          </div>
                          <div>
                            Bastidores:{" "}
                            {
                              instagramReport.analysis.recommendations
                                ?.contentMix?.behindScenes
                            }
                            %
                          </div>
                          <div>
                            Vendas:{" "}
                            {
                              instagramReport.analysis.recommendations
                                ?.contentMix?.sales
                            }
                            %
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-2">
                          Ideias Específicas
                        </p>
                        <div className="space-y-1 text-xs text-purple-700">
                          {instagramReport.analysis.recommendations?.specificIdeas
                            ?.slice(0, 3)
                            .map((idea: string, idx: number) => (
                              <div key={idx}>• {idea}</div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plano de Ação */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Plano de Ação (30 dias)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-2">
                          Semana 1-2
                        </p>
                        <div className="space-y-1 text-sm text-green-700">
                          {instagramReport.analysis.actionPlan?.week1_2?.map(
                            (action: string, idx: number) => (
                              <div key={idx}>✓ {action}</div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-2">
                          Semana 3-4
                        </p>
                        <div className="space-y-1 text-sm text-green-700">
                          {instagramReport.analysis.actionPlan?.week3_4?.map(
                            (action: string, idx: number) => (
                              <div key={idx}>✓ {action}</div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resultados Esperados */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Resultados Esperados
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            instagramReport.analysis.actionPlan?.expectedResults
                              ?.engagement
                          }
                        </p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {
                            instagramReport.analysis.actionPlan?.expectedResults
                              ?.followers
                          }
                        </p>
                        <p className="text-xs text-gray-600">Seguidores</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            instagramReport.analysis.actionPlan?.expectedResults
                              ?.leads
                          }
                        </p>
                        <p className="text-xs text-gray-600">Leads</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/content-hub")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Posts Prontos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {initialPosts.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Clica para ver no calendário
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Ideias Geradas
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {contentIdeas.length}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Meta de Seguidores
              </p>
              <p className="text-3xl font-bold text-gray-900">
                +{strategy.monthlyGoals.followers}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Engagement Meta
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {strategy.monthlyGoals.engagement}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Prontos em Cards */}
        <Card className="mb-8">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Posts Prontos para Publicar
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {initialPosts.length} posts gerados automaticamente pela IA
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/content-hub")}
              >
                Ver Todos no Calendário
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialPosts.map((post: any, index: number) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-xl transition-all border-2 hover:border-blue-300 cursor-pointer group"
                  onClick={() => router.push("/content-hub")}
                >
                  {/* Media do Post */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {post.mediaType === "video" ? (
                      <>
                        <img
                          src={post.thumbnailUrl || "/placeholder-video.jpg"}
                          alt={post.hook}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-16 h-16 text-white" />
                        </div>
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                          🎬 Reel
                        </Badge>
                      </>
                    ) : (
                      <>
                        <img
                          src={post.imageUrl || "/placeholder-image.jpg"}
                          alt={post.hook}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge
                          className={`absolute top-3 right-3 text-white border-0 ${
                            post.type === "educational"
                              ? "bg-blue-600"
                              : post.type === "viral"
                              ? "bg-purple-600"
                              : "bg-green-600"
                          }`}
                        >
                          {post.type === "educational"
                            ? "📚 Educativo"
                            : post.type === "viral"
                            ? "🔥 Viral"
                            : "💰 Vendas"}
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {post.bestTimeToPost}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {post.estimatedEngagement}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.hook}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.caption}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.hashtags
                        ?.slice(0, 3)
                        .map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      {post.hashtags?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {post.cta}
                      </span>
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/content-hub");
                        }}
                      >
                        Ver Mais
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Botão para ver todos */}
            {initialPosts.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => router.push("/content-hub")}
                >
                  <Calendar className="w-5 h-5" />
                  Ver Todos os Posts no Content Hub
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Strategy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content Pillars */}
          <Card>
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Pilares de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {strategy.contentPillars?.map((pillar: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {pillar.name}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {pillar.percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {pillar.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.examples?.map((example: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Format Mix */}
          <Card>
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-purple-600" />
                Mix de Formatos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {Object.entries(strategy.formatMix || {}).map(
                  ([format, percentage]: any) => {
                    const formatIcons: any = {
                      carousels: LayoutGrid,
                      reels: Video,
                      single: Image,
                      stories: Zap,
                    };
                    const FormatIcon = formatIcons[format] || LayoutGrid;

                    return (
                      <div key={format}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FormatIcon className="w-4 h-4 text-gray-600" />
                            <span className="font-medium capitalize text-gray-900">
                              {format}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">
                    Melhores Horários
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {strategy.postingSchedule?.bestTimes?.map((time: string) => (
                    <Badge key={time} className="bg-blue-600">
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-blue-700">
                  {strategy.postingSchedule?.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Ideas */}
        <Card>
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Ideias de Conteúdo
              </CardTitle>
              <Badge variant="outline">{contentIdeas.length} ideias</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentIdeas.map((idea: any, index: number) => (
                <Card
                  key={index}
                  className="p-4 hover:border-blue-300 transition-colors cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {idea.type}
                    </Badge>
                    <Badge
                      className={
                        idea.difficulty === "easy"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : idea.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {idea.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {idea.value}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{idea.estimatedTime}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Gerar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
