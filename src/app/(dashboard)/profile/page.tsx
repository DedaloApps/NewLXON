// src/app/(dashboard)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeaderPremium } from "@/components/layout/Header";
import {
  User,
  Mail,
  Lock,
  Bell,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Camera,
  Save,
  Loader2,
  Check,
  AlertCircle,
  CreditCard,
  Shield,
  Smartphone,
  Globe,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Crown,
  CheckCircle2,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para os dados do perfil
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
    subscriptionTier: "free",
    subscriptionStatus: "active",
  });

  // Estados para conexões sociais
  const [socialConnections, setSocialConnections] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
  });

  // Estados para estatísticas
  const [stats, setStats] = useState({
    postsCreated: 0,
    engagement: 0,
    followers: 0,
    accountAge: 0,
  });

  // Estado para detectar dispositivo
  const [deviceInfo, setDeviceInfo] = useState({
    browser: "",
    os: "",
    device: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    
    if (session?.user) {
      loadUserData();
      detectDevice();
    }
  }, [session, status, router]);

  // Detectar dispositivo real
  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    let browser = "Desconhecido";
    let os = "Desconhecido";
    let device = "Desktop";

    // Detectar Browser
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browser = "Safari";
    } else if (userAgent.includes("Edg")) {
      browser = "Edge";
    }

    // Detectar OS
    if (userAgent.includes("Win")) {
      os = "Windows";
    } else if (userAgent.includes("Mac")) {
      os = "macOS";
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
    } else if (userAgent.includes("Android")) {
      os = "Android";
      device = "Telemóvel";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      os = "iOS";
      device = userAgent.includes("iPad") ? "Tablet" : "Telemóvel";
    }

    // Detectar se é mobile
    if (/Mobi|Android/i.test(userAgent)) {
      device = "Telemóvel";
    }

    setDeviceInfo({ browser, os, device });
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const [profileResponse, postsResponse] = await Promise.all([
        axios.get("/api/user/profile"),
        axios.get("/api/posts").catch(() => ({ data: [] }))
      ]);

      const data = profileResponse.data;
      const posts = Array.isArray(postsResponse.data) ? postsResponse.data : [];

      const totalPosts = posts.length;
      
      const postsWithEngagement = posts.filter((p: any) => p.analytics?.length > 0);
      const avgEngagement = postsWithEngagement.length > 0
        ? postsWithEngagement.reduce((acc: number, post: any) => {
            const lastAnalytics = post.analytics[post.analytics.length - 1];
            return acc + (lastAnalytics?.engagementRate || 0);
          }, 0) / postsWithEngagement.length
        : 0;

      const totalFollowers = data.socialAccounts?.reduce(
        (sum: number, account: any) => sum + (account.followers || 0), 
        0
      ) || 0;

      setProfileData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        avatar: data.image || "",
        subscriptionTier: data.subscriptionTier || "free",
        subscriptionStatus: data.subscriptionStatus || "active",
      });

      setSocialConnections({
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        linkedin: data.linkedin || "",
        twitter: data.twitter || "",
      });

      setStats({
        postsCreated: totalPosts,
        engagement: Math.round(avgEngagement * 10) / 10,
        followers: totalFollowers,
        accountAge: data.accountAge || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      await axios.put("/api/user/profile", {
        ...profileData,
        socialConnections,
      });

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao guardar:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = () => {
    // Redirecionar para página de checkout
    router.push("/checkout");
  };

  const handleManageBilling = () => {
    // Abrir portal de billing do Stripe
    window.open("https://billing.stripe.com/p/login/test_xxx", "_blank");
  };

  if (loading || status === "loading") {
    return (
      <>
        <HeaderPremium
          userName={session?.user?.name || "Utilizador"}
          userEmail={session?.user?.email || ""}
          userAvatar={session?.user?.image || ""}
        />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const planFeatures = {
    free: [
      "3 posts por mês",
      "1 rede social",
      "Analytics básicos",
      "Suporte por email"
    ],
    pro: [
      "Posts ilimitados",
      "Todas as redes sociais",
      "Analytics avançados",
      "IA para geração de conteúdo",
      "Agendamento automático",
      "Suporte prioritário"
    ],
    enterprise: [
      "Tudo do Pro",
      "Múltiplas marcas",
      "API personalizada",
      "Gestor de conta dedicado",
      "SLA garantido",
      "Formação personalizada"
    ]
  };

  return (
    <>
      <HeaderPremium
        userName={profileData.name || session?.user?.name || "Utilizador"}
        userEmail={profileData.email || session?.user?.email || ""}
        userAvatar={profileData.avatar || session?.user?.image || ""}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          
          {/* Header Card - Perfil */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold">
                      {getInitials(profileData.name || session?.user?.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">
                    {profileData.name || session?.user?.name || "Utilizador"}
                  </h1>
                  <p className="text-gray-600 mb-3">
                    {profileData.email || session?.user?.email}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className={`${
                      profileData.subscriptionTier === "pro" || profileData.subscriptionTier === "enterprise"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-400"
                    }`}>
                      {profileData.subscriptionTier === "free" && "Plano Gratuito"}
                      {profileData.subscriptionTier === "pro" && (
                        <><Crown className="w-3 h-3 mr-1" />Plano Pro</>
                      )}
                      {profileData.subscriptionTier === "enterprise" && (
                        <><Zap className="w-3 h-3 mr-1" />Enterprise</>
                      )}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ativo há {stats.accountAge} dias
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A Guardar...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats.postsCreated}</p>
                <p className="text-sm text-gray-600">Posts Criados</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats.engagement}%</p>
                <p className="text-sm text-gray-600">Engagement</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{stats.followers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Seguidores</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">{stats.accountAge}</p>
                <p className="text-sm text-gray-600">Dias Ativo</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Informações Pessoais */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Configure os seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="O teu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telemóvel</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="+351 910 000 000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData({ ...profileData, location: e.target.value })
                      }
                      className="pl-10"
                      placeholder="Lisboa, Portugal"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociais */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  Redes Sociais
                </CardTitle>
                <CardDescription>
                  Conecte as suas contas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instagram */}
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Instagram</p>
                    <Input
                      value={socialConnections.instagram}
                      onChange={(e) =>
                        setSocialConnections({
                          ...socialConnections,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="@username"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  {socialConnections.instagram && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <Check className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Facebook</p>
                    <Input
                      value={socialConnections.facebook}
                      onChange={(e) =>
                        setSocialConnections({
                          ...socialConnections,
                          facebook: e.target.value,
                        })
                      }
                      placeholder="facebook.com/page"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  {socialConnections.facebook && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <Check className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-blue-700 rounded-lg">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">LinkedIn</p>
                    <Input
                      value={socialConnections.linkedin}
                      onChange={(e) =>
                        setSocialConnections({
                          ...socialConnections,
                          linkedin: e.target.value,
                        })
                      }
                      placeholder="linkedin.com/in/profile"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  {socialConnections.linkedin && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <Check className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-black rounded-lg">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">X</p>
                    <Input
                      value={socialConnections.twitter}
                      onChange={(e) =>
                        setSocialConnections({
                          ...socialConnections,
                          twitter: e.target.value,
                        })
                      }
                      placeholder="@username"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  {socialConnections.twitter && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <Check className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plano e Pagamento */}
          <Card className={`border-0 shadow-lg ${
            profileData.subscriptionTier === "pro" || profileData.subscriptionTier === "enterprise"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
              : "bg-white"
          }`}>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {profileData.subscriptionTier === "free" ? (
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Zap className="w-6 h-6 text-gray-600" />
                      </div>
                    ) : (
                      <div className="p-3 bg-white/20 rounded-full">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">
                        Plano {profileData.subscriptionTier === "free" ? "Gratuito" : 
                               profileData.subscriptionTier === "pro" ? "Pro" : "Enterprise"}
                      </h2>
                      <p className={`text-sm ${
                        profileData.subscriptionTier === "pro" || profileData.subscriptionTier === "enterprise"
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}>
                        {profileData.subscriptionTier === "free" 
                          ? "€0/mês"
                          : profileData.subscriptionTier === "pro"
                          ? "€29.99/mês"
                          : "€99.99/mês"}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {planFeatures[profileData.subscriptionTier as keyof typeof planFeatures].map((feature, index) => (
                      <li key={index} className={`flex items-center gap-2 text-sm ${
                        profileData.subscriptionTier === "pro" || profileData.subscriptionTier === "enterprise"
                          ? "text-white/90"
                          : "text-gray-600"
                      }`}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {profileData.subscriptionTier !== "free" && (
                    <Badge className="bg-white/20 text-white border-0">
                      <CreditCard className="w-3 h-3 mr-1" />
                      Próxima renovação: 15 Nov 2025
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {profileData.subscriptionTier === "free" ? (
                    <>
                      <Button
                        onClick={handleUpgrade}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Fazer Upgrade para Pro
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        Teste grátis de 14 dias
                      </p>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleManageBilling}
                        variant="outline"
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-50 border-0 shadow-md"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerir Pagamento
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Cancelar subscrição
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança e Sessões */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Segurança */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Password
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Ativar Autenticação 2FA
                </Button>

                <Separator />

                <div className="pt-2">
                  <h4 className="font-semibold text-sm mb-3">Sessão Ativa</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">
                          {deviceInfo.browser} em {deviceInfo.os}
                        </p>
                        <p className="text-xs text-gray-500">
                          {deviceInfo.device} • Agora
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Atual
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure as suas preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Notificações por Email</p>
                    <p className="text-xs text-gray-500">Receba updates importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Lembretes de Posts</p>
                    <p className="text-xs text-gray-500">Posts agendados para publicar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Relatório Semanal</p>
                    <p className="text-xs text-gray-500">Resumo do desempenho</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Novas Funcionalidades</p>
                    <p className="text-xs text-gray-500">Updates da plataforma</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}