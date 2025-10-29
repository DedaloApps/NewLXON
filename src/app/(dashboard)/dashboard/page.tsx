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
  Zap,
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
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstagramReport, setShowInstagramReport] = useState(false);
  const { data: session } = useSession();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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
      alert("Erro ao gerar PDF. Tente novamente.");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Loader2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <p className="text-gray-600">A carregar estratégia...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <Card className="max-w-md border-indigo-200 shadow-xl shadow-indigo-500/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Dados não encontrados
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados.
            </p>
            <Button
              onClick={() => router.push("/onboarding")}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full"
            >
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
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/20 to-white">
      {/* Header */}
      <HeaderPremium
        pageTitle="Dashboard"
        userName={session?.user?.name || "User"}
        userEmail={session?.user?.email || undefined}
        userAvatar={session?.user?.image || undefined}
        notificationCount={0}
      />

      <div className="bg-white/80 backdrop-blur-xl border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-1">
                    🎉 Estratégia criada com sucesso!
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Agentes de IA analisaram o negócio e criaram{" "}
                    {initialPosts.length} posts prontos para publicação
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-600">Negócio:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.businessDescription}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-600">Público:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.audience}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium text-gray-900">
                    {businessInfo.objective}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {platforms.map((platform: string) => (
                  <Badge
                    key={platform}
                    className="gap-1 bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    <Instagram className="w-3 h-3" />
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 border-indigo-200 hover:bg-indigo-50 rounded-full"
                onClick={() => router.push("/content-hub")}
              >
                <Calendar className="w-4 h-4" />
                Ver Calendário
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full shadow-lg shadow-indigo-500/30"
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
        {/* Instagram Report */}
        {instagramReport && (
          <Card className="mb-8 overflow-hidden border-indigo-200 shadow-xl shadow-indigo-500/10 p-0">
  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
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
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                  >
                    <Download className="w-4 h-4" />
                    PDF Completo
                  </Button>
                  <Button
                    onClick={() => setShowInstagramReport(!showInstagramReport)}
                    variant="outline"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
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

            <CardContent className="p-6 pt-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(
                        instagramReport.analysis.overallScore
                      )} flex items-center justify-center text-white text-3xl font-semibold mb-2 shadow-lg`}
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
                        <div className="p-2 bg-indigo-100 rounded-xl">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {instagramReport.analysis.profileScore}
                      </p>
                      <p className="text-xs text-gray-600">Perfil / 20</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-violet-100 rounded-xl">
                          <LayoutGrid className="w-5 h-5 text-violet-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {instagramReport.analysis.contentScore}
                      </p>
                      <p className="text-xs text-gray-600">Conteúdo / 30</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-green-100 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {instagramReport.analysis.engagementScore}
                      </p>
                      <p className="text-xs text-gray-600">Engagement / 25</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                          <Hash className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
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
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
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
                <div className="mt-6 pt-6 border-t border-indigo-100 space-y-6">
                  {/* Recomendações */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Recomendações
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-sm font-medium text-indigo-900 mb-1">
                          Mix de Conteúdo
                        </p>
                        <div className="space-y-1 text-xs text-indigo-700">
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

                      <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <p className="text-sm font-medium text-violet-900 mb-2">
                          Ideias Específicas
                        </p>
                        <div className="space-y-1 text-xs text-violet-700">
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
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
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

                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
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
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Resultados Esperados
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {
                            instagramReport.analysis.actionPlan?.expectedResults
                              ?.engagement
                          }
                        </p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-violet-600">
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
          {[
            {
              icon: CheckCircle,
              label: "Posts Prontos",
              value: initialPosts.length,
              bgColor: "bg-green-100",
              textColor: "text-green-600",
              action: () => router.push("/content-hub"),
            },
            {
              icon: Lightbulb,
              label: "Ideias Geradas",
              value: contentIdeas.length,
              bgColor: "bg-yellow-100",
              textColor: "text-yellow-600",
            },
            {
              icon: Users,
              label: "Meta de Seguidores",
              value: `+${strategy.monthlyGoals.followers}`,
              bgColor: "bg-indigo-100",
              textColor: "text-indigo-600",
            },
            {
              icon: BarChart3,
              label: "Engagement Meta",
              value: `${strategy.monthlyGoals.engagement}%`,
              bgColor: "bg-violet-100",
              textColor: "text-violet-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`hover:shadow-xl transition-all border-indigo-100 ${
                  stat.action ? "cursor-pointer" : ""
                }`}
                onClick={stat.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <ArrowUpRight className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Posts Prontos */}
        <Card className="mb-8 border-indigo-100 shadow-xl shadow-indigo-500/5">
          <CardHeader className="border-b border-indigo-100 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Posts Prontos para Publicar
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {initialPosts.length} posts gerados automaticamente pela IA
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-indigo-200 hover:bg-indigo-50 rounded-full"
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
                  className="overflow-hidden hover:shadow-xl transition-all border-2 border-indigo-100 hover:border-indigo-300 cursor-pointer"
                  onClick={() => router.push("/content-hub")}
                >
                  {/* Media do Post */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden group">
                    {post.mediaType === "video" || post.videoUrl ? (
                      <div
                        className="relative cursor-pointer w-full h-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideo(post.videoUrl);
                          setVideoModalOpen(true);
                        }}
                      >
                        <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800">
                          {post.videoUrl ? (
                            <>
                              <video
                                src={post.videoUrl}
                                className="w-full h-full object-cover opacity-0 transition-opacity duration-500"
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedData={(e) => {
                                  e.currentTarget.currentTime = 0.1;
                                  e.currentTarget.style.opacity = "1";
                                }}
                              />

                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white pointer-events-none">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                                  <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6">
                                    <Play className="w-12 h-12 text-white" />
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-semibold mb-1">
                                    Reel do Instagram
                                  </p>
                                  <p className="text-sm text-white/80">
                                    Clique para ver
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : post.thumbnailUrl ||
                            post.visualMetadata?.thumbnailUrl ? (
                            <img
                              src={
                                post.thumbnailUrl ||
                                post.visualMetadata?.thumbnailUrl
                              }
                              alt={post.hook}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6">
                                  <Video className="w-12 h-12" />
                                </div>
                              </div>
                              <p className="text-sm font-medium">
                                Sem preview disponível
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                            <Play className="w-12 h-12 text-white fill-white" />
                          </div>
                        </div>

                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 shadow-lg">
                          🎬 Reel
                        </Badge>

                        {post.duration && (
                          <Badge className="absolute bottom-3 right-3 bg-black/80 text-white border-0">
                            {post.duration}s
                          </Badge>
                        )}
                      </div>
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
                              ? "bg-indigo-600"
                              : post.type === "viral"
                              ? "bg-violet-600"
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
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 border-indigo-200"
                      >
                        <Clock className="w-3 h-3" />
                        {post.bestTimeToPost}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 border-indigo-200"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {post.estimatedEngagement}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
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
                            className="text-xs bg-indigo-50 text-indigo-700"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      {post.hashtags?.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-indigo-50 text-indigo-700"
                        >
                          +{post.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {post.cta}
                      </span>
                      <Button
                        size="sm"
                        className="gap-1 bg-indigo-600 hover:bg-indigo-700"
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

            {initialPosts.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full shadow-lg shadow-indigo-500/30"
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
          <Card className="border-indigo-100">
            <CardHeader className="border-b border-indigo-100 bg-white">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Pilares de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {strategy.contentPillars?.map((pillar: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-4 border-indigo-600 pl-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {pillar.name}
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {pillar.percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {pillar.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.examples?.map((example: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs border-indigo-200"
                        >
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
          <Card className="border-indigo-100">
            <CardHeader className="border-b border-indigo-100 bg-white">
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-violet-600" />
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
                            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-900">
                    Melhores Horários
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {strategy.postingSchedule?.bestTimes?.map((time: string) => (
                    <Badge key={time} className="bg-indigo-600">
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-indigo-700">
                  {strategy.postingSchedule?.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Ideas */}
        <Card className="border-indigo-100">
          <CardHeader className="border-b border-indigo-100 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Ideias de Conteúdo
              </CardTitle>
              <Badge variant="outline" className="border-indigo-200">
                {contentIdeas.length} ideias
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentIdeas.map((idea: any, index: number) => (
                <Card
                  key={index}
                  className="p-4 hover:border-indigo-300 transition-colors cursor-pointer hover:shadow-md border-indigo-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize border-indigo-200"
                    >
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
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-indigo-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{idea.estimatedTime}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-indigo-200 hover:bg-indigo-50"
                    >
                      Gerar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Vídeo */}
      {videoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => {
            setVideoModalOpen(false);
            setSelectedVideo(null);
          }}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setVideoModalOpen(false);
                setSelectedVideo(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <span>Fechar</span>
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                  ✕
                </div>
              </div>
            </button>

            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full aspect-[9/16] max-h-[80vh] object-contain"
                controlsList="nodownload"
              >
                O navegador não suporta vídeo.
              </video>
            </div>

            <div className="mt-4 text-center">
              <p className="text-white/80 text-sm">
                💡 Dica: Download ou partilha disponíveis
              </p>
              <div className="flex justify-center gap-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                  onClick={() => window.open(selectedVideo, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir em Nova Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                  onClick={async () => {
                    try {
                      const response = await fetch(selectedVideo);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `reel-${Date.now()}.mp4`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Erro ao fazer download:", error);
                      window.open(selectedVideo, "_blank");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
