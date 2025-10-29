// src/app/(dashboard)/communication-strategy/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderPremium } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ArrowLeft,
  Download,
  FileText,
  Target,
  Users,
  Megaphone,
  Palette,
  MessageSquare,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CommunicationStrategyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<any>(null);

  useEffect(() => {
    loadStrategy();
  }, []);

  const loadStrategy = async () => {
    try {
      const response = await fetch("/api/communication-strategy");
      const data = await response.json();
      
      if (data.strategy) {
        setStrategy(data.strategy);
      }
    } catch (error) {
      console.error("Erro ao carregar estratégia:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implementar download PDF
    alert("Funcionalidade de download em desenvolvimento");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
        <HeaderPremium
          pageTitle="Estratégia de Comunicação"
          userName={session?.user?.name || "User"}
          userEmail={session?.user?.email || undefined}
          userAvatar={session?.user?.image || undefined}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar estratégia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
        <HeaderPremium
          pageTitle="Estratégia de Comunicação"
          userName={session?.user?.name || "User"}
          userEmail={session?.user?.email || undefined}
          userAvatar={session?.user?.image || undefined}
        />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Estratégia não encontrada</h3>
              <p className="text-gray-600 mb-6">
                Complete o onboarding primeiro para gerar a estratégia de comunicação.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sections = [
    {
      icon: Target,
      title: "Resumo Executivo",
      key: "executiveSummary",
      color: "purple",
    },
    {
      icon: Users,
      title: "Análise de Audiência",
      key: "audienceAnalysis",
      color: "blue",
    },
    {
      icon: Megaphone,
      title: "Voz da Marca",
      key: "brandVoice",
      color: "pink",
    },
    {
      icon: FileText,
      title: "Estratégia de Conteúdo",
      key: "contentStrategy",
      color: "indigo",
    },
    {
      icon: Palette,
      title: "Identidade Visual",
      key: "visualIdentity",
      color: "violet",
    },
    {
      icon: MessageSquare,
      title: "Estratégia de Engagement",
      key: "engagementStrategy",
      color: "green",
    },
    {
      icon: TrendingUp,
      title: "Estratégia de Distribuição",
      key: "distributionStrategy",
      color: "orange",
    },
    {
      icon: CheckCircle,
      title: "Estratégia de Conversão",
      key: "conversionStrategy",
      color: "teal",
    },
    {
      icon: BarChart3,
      title: "Framework de Medição",
      key: "measurementFramework",
      color: "cyan",
    },
    {
      icon: AlertTriangle,
      title: "Gestão de Riscos",
      key: "riskManagement",
      color: "red",
    },
    {
      icon: Calendar,
      title: "Roadmap de Implementação",
      key: "implementationRoadmap",
      color: "amber",
    },
    {
      icon: Lightbulb,
      title: "Definição de Sucesso",
      key: "successDefinition",
      color: "emerald",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
      <HeaderPremium
        pageTitle="Estratégia de Comunicação"
        userName={session?.user?.name || "User"}
        userEmail={session?.user?.email || undefined}
        userAvatar={session?.user?.image || undefined}
      />

      {/* Header da Página */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Estratégia de Comunicação Integrada
              </h1>
              <p className="text-gray-600">
                Plano estratégico completo para maximizar resultados nas redes sociais
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="w-4 h-4" />
              Descarregar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo Executivo em Destaque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {strategy.executiveSummary && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Visão</h4>
                    <p className="text-gray-700">{strategy.executiveSummary.vision}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Missão</h4>
                    <p className="text-gray-700">{strategy.executiveSummary.mission}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mensagem Central</h4>
                    <p className="text-lg font-medium text-purple-600">
                      {strategy.executiveSummary.coreMessage}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diferenciador Único</h4>
                    <Badge className="text-sm py-2 px-4 bg-purple-100 text-purple-700">
                      {strategy.executiveSummary.differentiator}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid de Seções */}
        <div className="space-y-6">
          {sections.slice(1).map((section, index) => {
            const Icon = section.icon;
            const data = strategy[section.key];
            
            if (!data) return null;

            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-gray-200">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Icon className={`w-5 h-5 text-${section.color}-600`} />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      {renderSection(data, section.key)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper para renderizar diferentes tipos de seção
function renderSection(data: any, key: string) {
  if (typeof data === "string") {
    return <p>{data}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([subKey, subValue]) => (
          <div key={subKey}>
            <h4 className="font-semibold text-gray-900 mb-2 capitalize">
              {subKey.replace(/([A-Z])/g, " $1").trim()}
            </h4>
            {typeof subValue === "string" ? (
              <p className="text-gray-700">{subValue}</p>
            ) : Array.isArray(subValue) ? (
              <ul className="space-y-1 ml-4">
                {subValue.map((item, i) => (
                  <li key={i} className="text-gray-700">
                    • {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : typeof subValue === "object" ? (
              <div className="ml-4 space-y-2">
                {renderSection(subValue, subKey)}
              </div>
            ) : (
              <p className="text-gray-700">{String(subValue)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <p>{String(data)}</p>;
}