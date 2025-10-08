// src/components/features/instagram-report.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Instagram, AlertCircle, CheckCircle } from "lucide-react";

interface InstagramReportProps {
  report: any;
}

export function InstagramReport({ report }: InstagramReportProps) {
  if (!report) return null;

  const analysis = report.analysis;

  const handleDownloadPDF = async () => {
    try {
      // Abrir em nova janela para imprimir/salvar como PDF
      const response = await fetch("/api/instagram/report-pdf");
      const html = await response.text();
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Auto-abrir diálogo de impressão
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tenta novamente.");
    }
  };

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
    <Card className="mb-8 border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">Relatório Instagram</CardTitle>
              <p className="text-sm text-gray-600">@{report.username}</p>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Score Geral */}
        <div className="text-center mb-8">
          <div
            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getScoreBgColor(
              analysis.overallScore
            )} flex items-center justify-center text-white text-4xl font-bold mb-4`}
          >
            {analysis.overallScore}
          </div>
          <p className={`text-xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore >= 80
              ? "🎉 Excelente!"
              : analysis.overallScore >= 60
              ? "👍 Bom, mas pode melhorar"
              : "⚠️ Precisa de atenção"}
          </p>
        </div>

        {/* Breakdown de Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Perfil</p>
            <p className="text-2xl font-bold">{analysis.profileScore}/20</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Conteúdo</p>
            <p className="text-2xl font-bold">{analysis.contentScore}/30</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Engagement</p>
            <p className="text-2xl font-bold">{analysis.engagementScore}/25</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Hashtags</p>
            <p className="text-2xl font-bold">{analysis.hashtagScore}/15</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Benchmark</p>
            <p className="text-2xl font-bold">{analysis.benchmarkScore}/10</p>
          </div>
        </div>

        {/* Problemas Críticos */}
        {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Problemas Críticos
            </h3>
            <div className="space-y-3">
              {analysis.criticalIssues.map((issue: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.severity === "urgent"
                      ? "bg-red-50 border-red-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      className={
                        issue.severity === "urgent"
                          ? "bg-red-600"
                          : "bg-yellow-600"
                      }
                    >
                      {issue.severity === "urgent" ? "URGENTE" : "IMPORTANTE"}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-bold mb-1">{issue.issue}</p>
                      <p className="text-sm text-gray-600">{issue.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Posts/semana</p>
            <p className="text-2xl font-bold">
              {analysis.contentAnalysis.avgPostsPerWeek}x
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold">
              {analysis.engagementAnalysis.engagementRate}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Caption média</p>
            <p className="text-2xl font-bold">
              {analysis.contentAnalysis.avgCaptionLength} chars
            </p>
          </div>
        </div>

        {/* Plano de Ação Resumido */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Próximos Passos (30 dias)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm text-gray-700 mb-2">
                Semana 1-2:
              </p>
              <ul className="space-y-1 text-sm">
                {analysis.actionPlan.week1_2.slice(0, 3).map((action: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-700 mb-2">
                Semana 3-4:
              </p>
              <ul className="space-y-1 text-sm">
                {analysis.actionPlan.week3_4.slice(0, 3).map((action: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="font-medium text-sm mb-2">📊 Resultados Esperados:</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Engagement: </span>
                <span className="font-bold">
                  {analysis.actionPlan.expectedResults.engagement}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Seguidores: </span>
                <span className="font-bold">
                  {analysis.actionPlan.expectedResults.followers}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Leads: </span>
                <span className="font-bold">
                  {analysis.actionPlan.expectedResults.leads}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleDownloadPDF} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Download Relatório Completo (PDF)
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            O relatório completo tem análises detalhadas, gráficos e muito mais
          </p>
        </div>
      </CardContent>
    </Card>
  );
}