// src/app/(dashboard)/dashboard/page.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Download } from "lucide-react";
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
  ChevronLeft,
  ChevronRight,
  Play,
  Layers,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InstagramReport } from "@/components/features/instagram-report";

// PostCard Component integrado
interface PostCardProps {
  post: {
    type: 'educational' | 'viral' | 'sales';
    format?: 'SINGLE' | 'CAROUSEL' | 'REEL' | 'VIDEO';
    hook: string;
    caption: string;
    hashtags: string[];
    cta: string;
    imageUrl?: string;
    mediaUrls?: string[];
    videoUrl?: string;
    thumbnailUrl?: string;
    estimatedEngagement: string;
    bestTimeToPost: string;
    carouselSlides?: Array<{
      title: string;
      content: string;
      imageUrl: string;
    }>;
  };
  onPublish?: () => void;
}

function PostCard({ post, onPublish }: PostCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const postFormat = post.format || 
    (post.videoUrl ? 'REEL' : 
     post.carouselSlides?.length ? 'CAROUSEL' : 
     post.mediaUrls?.length && post.mediaUrls.length > 1 ? 'CAROUSEL' : 
     'SINGLE');

  const getBadgeStyles = () => {
    switch (post.type) {
      case 'educational':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'viral':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'sales':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case 'educational':
        return '📚 Educativo';
      case 'viral':
        return '🔥 Viral';
      case 'sales':
        return '💰 Vendas';
      default:
        return '📄 Post';
    }
  };

  const renderMedia = () => {
    // REEL ou VÍDEO
    if (postFormat === 'REEL' || postFormat === 'VIDEO') {
      return (
        <div className="relative h-80 bg-gray-900 group rounded-t-lg overflow-hidden">
          {post.thumbnailUrl ? (
            <>
              <img
                src={post.thumbnailUrl}
                alt={post.hook}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white" />
              </div>
            </>
          ) : post.videoUrl ? (
            <video
              src={post.videoUrl}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-2" />
                <p>Vídeo será gerado</p>
              </div>
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
            🎬 {postFormat === 'REEL' ? 'Reel' : 'Vídeo'}
          </Badge>
        </div>
      );
    }

    

    // CARROSSEL
    if (postFormat === 'CAROUSEL') {
      const slides = post.carouselSlides || 
        (post.mediaUrls?.map((url, i) => ({
          title: `Slide ${i + 1}`,
          content: '',
          imageUrl: url
        })) || []);

      if (slides.length === 0) {
        return (
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center rounded-t-lg">
            <div className="text-center text-gray-500">
              <Layers className="w-16 h-16 mx-auto mb-2" />
              <p>Carrossel será gerado</p>
            </div>
          </div>
        );
      }

      return (
        <div className="relative h-80 bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={slides[currentSlide]?.imageUrl}
            alt={slides[currentSlide]?.title || post.hook}
            className="w-full h-full object-cover"
          />
          
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
            📚 Carrossel {currentSlide + 1}/{slides.length}
          </Badge>
        </div>
      );
    }

    // POST ÚNICO
    return (
      <div className="relative h-80 bg-gray-100 rounded-t-lg overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.hook}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Image className="w-16 h-16 mx-auto mb-2" />
              <p>Imagem será gerada</p>
            </div>
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${getBadgeStyles()} text-white border-0`}>
          {getTypeLabel()}
        </Badge>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
      {renderMedia()}

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getBadgeStyles()} text-white gap-1`}>
              {post.type === 'educational' && <BookOpen className="w-3 h-3" />}
              {post.type === 'viral' && <Zap className="w-3 h-3" />}
              {post.type === 'sales' && <ShoppingCart className="w-3 h-3" />}
              {getTypeLabel()}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {post.bestTimeToPost}
            </Badge>
            {postFormat !== 'SINGLE' && (
              <Badge variant="outline" className="gap-1">
                {postFormat === 'CAROUSEL' && <LayoutGrid className="w-3 h-3" />}
                {postFormat === 'REEL' && <Video className="w-3 h-3" />}
                {postFormat === 'CAROUSEL' ? 'Carrossel' : 
                 postFormat === 'REEL' ? 'Reel' : 'Vídeo'}
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={onPublish} className="gap-1">
            <CheckCircle className="w-4 h-4" />
            Publicar
          </Button>
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3">{post.hook}</h3>
        <p className="text-gray-700 mb-4 line-clamp-3">{post.caption}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.slice(0, 6).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-blue-600 gap-1">
              <Hash className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
          {post.hashtags.length > 6 && (
            <span className="text-sm text-gray-400">
              +{post.hashtags.length - 6} mais
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t">
          <span className="flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span className="font-medium">CTA:</span> {post.cta}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Engagement:</span> 
            <span className="capitalize">{post.estimatedEngagement}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstagramReport, setShowInstagramReport] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const generateMediaForPosts = async () => {
    setIsGeneratingMedia(true);
    
    try {
      const response = await axios.post('/api/posts/generate-with-media', {
        posts: data.initialPosts,
        generateMedia: true,
        saveToDatabase: false
      });

      if (response.data.success) {
        setData({
          ...data,
          initialPosts: response.data.posts
        });
      }
    } catch (error) {
      console.error('Erro ao gerar mídia:', error);
    } finally {
      setIsGeneratingMedia(false);
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
            <h3 className="text-lg font-semibold mb-2">Dados não encontrados</h3>
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showConfetti && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Estratégia criada com sucesso
                  </h3>
                  <p className="text-sm text-blue-700">
                    Os agentes de IA analisaram o teu negócio e criaram um plano completo personalizado
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Dashboard de Conteúdo
              </h1>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Negócio:</span>
                  <span className="font-medium text-gray-900">{businessInfo.businessDescription}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Público:</span>
                  <span className="font-medium text-gray-900">{businessInfo.audience}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium text-gray-900">{businessInfo.objective}</span>
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

            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram Report - Compact */}
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
                    <p className="text-sm text-white/80">@{instagramReport.username}</p>
                  </div>
                </div>
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
                      Ver Imagem
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!showInstagramReport ? (
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(
                          instagramReport.analysis.overallScore
                        )} flex items-center justify-center text-white text-3xl font-bold mb-2`}
                      >
                        {instagramReport.analysis.overallScore}
                      </div>
                      <p className={`text-sm font-medium ${getScoreColor(instagramReport.analysis.overallScore)}`}>
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

                  <div className="text-right">
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
                </div>

                {instagramReport.analysis.criticalIssues &&
                  instagramReport.analysis.criticalIssues.length > 0 && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900">
                            {instagramReport.analysis.criticalIssues.length} problema(s) crítico(s) identificado(s)
                          </p>
                          <p className="text-sm text-amber-700 mt-1">
                            Clique em "Ver Completo" para ver detalhes e plano de ação
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            ) : (
              <InstagramReport report={instagramReport} />
            )}
          </Card>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Posts Prontos</p>
              <p className="text-3xl font-bold text-gray-900">{initialPosts.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ideias Geradas</p>
              <p className="text-3xl font-bold text-gray-900">{contentIdeas.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Meta de Seguidores</p>
              <p className="text-3xl font-bold text-gray-900">+{strategy.monthlyGoals.followers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Engagement Meta</p>
              <p className="text-3xl font-bold text-gray-900">{strategy.monthlyGoals.engagement}%</p>
            </CardContent>
          </Card>
        </div>

{/* Posts Prontos - VERSÃO ATUALIZADA */}
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CheckCircle className="w-5 h-5 text-green-600" />
      Posts Prontos para Publicar
    </CardTitle>
    <p className="text-sm text-gray-600">2 Imagens + 1 Reel gerados automaticamente</p>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {initialPosts.map((post: any, index: number) => (
        <div
          key={index}
          className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
        >
          {/* Media do Post - IMAGEM ou VÍDEO */}
          {post.mediaType === 'video' ? (
            // REEL/VÍDEO
            <div className="relative bg-black" style={{ aspectRatio: '9/16', maxHeight: '600px' }}>
              <video
                src={post.videoUrl}
                poster={post.thumbnailUrl}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              >
                <source src={post.videoUrl} type="video/mp4" />
                O teu browser não suporta vídeo.
              </video>
              
              {/* Badge de REEL */}
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  🎬 REEL
                </Badge>
                <Badge className="bg-black/70 text-white">
                  {post.duration}s
                </Badge>
              </div>
              
              {/* Badge de tipo de conteúdo */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-600 text-white">
                  💰 Vendas/CTA
                </Badge>
              </div>
            </div>
          ) : (
            // IMAGEM
            <div className="relative h-64 bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.hook}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge
                  className={
                    post.contentType === "educational"
                      ? "bg-blue-600 text-white"
                      : "bg-purple-600 text-white"
                  }
                >
                  {post.contentType === "educational"
                    ? "📚 Educativo"
                    : "🔥 Viral"}
                </Badge>
              </div>
            </div>
          )}

          {/* Conteúdo do Post */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {post.bestTimeToPost}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {post.mediaType === 'video' ? '9:16' : '1:1'}
                </Badge>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Publicar Agora
              </Button>
            </div>

            <h3 className="font-bold text-lg mb-2">{post.hook}</h3>
            <p className="text-gray-700 mb-3 line-clamp-3">{post.caption}</p>

            {/* Script do vídeo (se for reel) */}
            {post.videoScript && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs font-semibold text-purple-700 mb-1">
                  📝 Script do Reel:
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {post.videoScript}
                </p>
              </div>
            )}

            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.hashtags.slice(0, 5).map((tag: string, i: number) => (
                <span key={i} className="text-sm text-blue-600">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Métricas */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                CTA: {post.cta}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Engagement: {post.estimatedEngagement}
              </span>
              {post.mediaType === 'video' && (
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {post.duration}s
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
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
                {strategy.contentPillars.map((pillar: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{pillar.name}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {pillar.percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pillar.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.examples.map((example: string, i: number) => (
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
                {Object.entries(strategy.formatMix).map(([format, percentage]: any) => {
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
                          <span className="font-medium capitalize text-gray-900">{format}</span>
                        </div>
                        <span className="font-bold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Melhores Horários</h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {strategy.postingSchedule.bestTimes.map((time: string) => (
                    <Badge key={time} className="bg-blue-600">
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-blue-700">
                  {strategy.postingSchedule.reasoning}
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
                  className="p-4 hover:border-blue-300 transition-colors cursor-pointer"
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
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.value}</p>
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
      {/* MODAL DE IMAGEM */}
{/* MODAL DE IMAGEM E CONTEÚDO COMPLETO */}
<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
    <DialogHeader className="px-6 py-4 border-b bg-white">
      <DialogTitle className="flex items-center justify-between">
        <span className="text-xl font-bold">Preview Completo do Post</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (selectedImage) {
                window.open(selectedImage, "_blank");
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogTitle>
    </DialogHeader>
    
    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
      {selectedImage && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Coluna da Imagem - 2/5 */}
          <div className="lg:col-span-2 bg-gray-50 p-6 flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto rounded-lg shadow-2xl max-h-[70vh] object-contain"
            />
          </div>

          {/* Coluna do Conteúdo - 3/5 */}
          <div className="lg:col-span-3 p-8 space-y-6 bg-white">
            {(() => {
              const post = initialPosts.find((p: any) => p.imageUrl === selectedImage);
              if (!post) return null;

              return (
                <>
                  {/* Header com badges */}
                  <div className="flex items-center gap-2 flex-wrap pb-4 border-b">
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        post.type === "educational"
                          ? "bg-blue-600 text-white"
                          : post.type === "viral"
                          ? "bg-purple-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {post.type === "educational"
                        ? "📚 Educativo"
                        : post.type === "viral"
                        ? "🔥 Viral"
                        : "💰 Vendas"}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
                      <Clock className="w-3 h-3" />
                      {post.bestTimeToPost}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
                      <TrendingUp className="w-3 h-3" />
                      {post.estimatedEngagement}
                    </Badge>
                  </div>

                  {/* Hook */}
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                      {post.hook}
                    </h3>
                  </div>

                  {/* Caption Completa */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Caption
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                        {post.caption}
                      </p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Hashtags
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags?.map((tag: string, i: number) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1 uppercase tracking-wide">
                          Call to Action
                        </h4>
                        <p className="text-blue-800 font-medium text-base">{post.cta}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3 pt-6 border-t">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
                      onClick={() => {
                        setSelectedImage(null);
                      }}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Publicar Agora
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-12 px-6"
                      onClick={() => {
                        setSelectedImage(null);
                        router.push('/content-hub');
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Editar
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}