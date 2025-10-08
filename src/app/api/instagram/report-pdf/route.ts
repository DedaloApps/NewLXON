// src/app/api/instagram/report-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboarding: true,
      },
    });

    if (!user?.onboarding?.instagramReport) {
      return NextResponse.json(
        { error: "Relatório do Instagram não encontrado" },
        { status: 404 }
      );
    }

    const report = JSON.parse(user.onboarding.instagramReport);

    // Gerar HTML do relatório
    const html = generateReportHTML(report, {
      business: user.onboarding.business,
      businessDescription: user.onboarding.businessDescription,
    });

    // Retornar HTML que pode ser convertido em PDF no frontend
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}

function generateReportHTML(report: any, businessInfo: any): string {
  const analysis = report.analysis;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Instagram - @${report.username}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #f9fafb;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .username {
      font-size: 24px;
      color: #6b7280;
    }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      margin: 30px auto;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background: #f9fafb;
      border-left: 4px solid #3b82f6;
    }
    .section h2 {
      color: #1e40af;
      margin-bottom: 15px;
      font-size: 24px;
    }
    .section h3 {
      color: #374151;
      margin: 15px 0 10px 0;
      font-size: 18px;
    }
    .score-bar {
      background: #e5e7eb;
      height: 30px;
      border-radius: 15px;
      overflow: hidden;
      margin: 10px 0;
    }
    .score-bar-fill {
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 15px;
      color: white;
      font-weight: bold;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .issue {
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
    }
    .issue.urgent {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
    }
    .issue.important {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .issue-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .recommendations {
      list-style: none;
      padding: 0;
    }
    .recommendations li {
      padding: 10px;
      margin: 5px 0;
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }
    .action-plan {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Análise Instagram</h1>
      <p class="username">@${report.username}</p>
      <p style="color: #6b7280; margin-top: 10px;">
        ${businessInfo.businessDescription} | Gerado em ${new Date().toLocaleDateString('pt-PT')}
      </p>
    </div>

    <div class="score-circle">
      ${analysis.overallScore}/100
    </div>
    
    <p style="text-align: center; font-size: 18px; color: #6b7280; margin-bottom: 30px;">
      ${analysis.overallScore >= 80 ? '🎉 Excelente!' : 
        analysis.overallScore >= 60 ? '👍 Bom, mas há margem para melhorar' :
        '⚠️ Precisa de melhorias significativas'}
    </p>

    <!-- Análise do Perfil -->
    <div class="section">
      <h2>📸 Análise do Perfil</h2>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${(analysis.profileScore/20)*100}%">
          ${analysis.profileScore}/20
        </div>
      </div>
      <ul>
        ${analysis.profileAnalysis.feedback.map((f: string) => `<li>• ${f}</li>`).join('')}
      </ul>
    </div>

    <!-- Análise de Conteúdo -->
    <div class="section">
      <h2>✍️ Análise de Conteúdo</h2>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${(analysis.contentScore/30)*100}%">
          ${analysis.contentScore}/30
        </div>
      </div>
      
      <h3>📊 Estatísticas:</h3>
      <div class="metric">
        <span>Posts (últimos 30 dias):</span>
        <strong>${analysis.contentAnalysis.postsLast30Days}</strong>
      </div>
      <div class="metric">
        <span>Frequência média:</span>
        <strong>${analysis.contentAnalysis.avgPostsPerWeek}x/semana</strong>
      </div>
      <div class="metric">
        <span>Tamanho médio das captions:</span>
        <strong>${analysis.contentAnalysis.avgCaptionLength} caracteres</strong>
      </div>
      <div class="metric">
        <span>Posts com CTA:</span>
        <strong>${analysis.contentAnalysis.ctaUsage}%</strong>
      </div>
      
      <h3>📹 Distribuição de Formatos:</h3>
      <div class="metric">
        <span>Imagens:</span>
        <strong>${analysis.contentAnalysis.formatDistribution.images}%</strong>
      </div>
      <div class="metric">
        <span>Vídeos/Reels:</span>
        <strong>${analysis.contentAnalysis.formatDistribution.videos}%</strong>
      </div>
      <div class="metric">
        <span>Carrosséis:</span>
        <strong>${analysis.contentAnalysis.formatDistribution.carousels}%</strong>
      </div>
    </div>

    <!-- Engagement -->
    <div class="section">
      <h2>📈 Engagement</h2>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${(analysis.engagementScore/25)*100}%">
          ${analysis.engagementScore}/25
        </div>
      </div>
      <div class="metric">
        <span>Taxa de Engagement:</span>
        <strong>${analysis.engagementAnalysis.engagementRate}%</strong>
      </div>
      <div class="metric">
        <span>Benchmark do nicho:</span>
        <strong>${analysis.engagementAnalysis.benchmarkEngagement}%</strong>
      </div>
      <div class="metric">
        <span>Likes médios:</span>
        <strong>${analysis.engagementAnalysis.avgLikes}</strong>
      </div>
      <div class="metric">
        <span>Comentários médios:</span>
        <strong>${analysis.engagementAnalysis.avgComments}</strong>
      </div>
    </div>

    <!-- Hashtags -->
    <div class="section">
      <h2>#️⃣ Estratégia de Hashtags</h2>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${(analysis.hashtagScore/15)*100}%">
          ${analysis.hashtagScore}/15
        </div>
      </div>
      <p><strong>Número médio usado:</strong> ${analysis.hashtagAnalysis.avgHashtagsUsed}</p>
      <p><strong>Top hashtags:</strong> ${analysis.hashtagAnalysis.topHashtags.map((h: any) => `#${h.tag}`).join(', ')}</p>
    </div>

    <!-- Problemas Críticos -->
    <div class="section">
      <h2>🚨 Problemas Identificados</h2>
      ${analysis.criticalIssues.map((issue: any) => `
        <div class="issue ${issue.severity}">
          <div class="issue-title">${issue.severity === 'urgent' ? '🚨' : '⚠️'} ${issue.issue}</div>
          <p>${issue.impact}</p>
        </div>
      `).join('')}
    </div>

    <!-- Plano de Ação -->
    <div class="action-plan">
      <h2 style="color: #059669; margin-bottom: 20px;">🎯 Plano de Ação (30 dias)</h2>
      
      <h3 style="color: #047857;">Semana 1-2:</h3>
      <ul class="recommendations">
        ${analysis.actionPlan.week1_2.map((action: string) => `<li>✅ ${action}</li>`).join('')}
      </ul>
      
      <h3 style="color: #047857; margin-top: 20px;">Semana 3-4:</h3>
      <ul class="recommendations">
        ${analysis.actionPlan.week3_4.map((action: string) => `<li>✅ ${action}</li>`).join('')}
      </ul>
      
      <h3 style="color: #047857; margin-top: 20px;">📊 Resultados Esperados:</h3>
      <div class="metric">
        <span>Engagement:</span>
        <strong>${analysis.actionPlan.expectedResults.engagement}</strong>
      </div>
      <div class="metric">
        <span>Novos seguidores:</span>
        <strong>${analysis.actionPlan.expectedResults.followers}</strong>
      </div>
      <div class="metric">
        <span>Leads gerados:</span>
        <strong>${analysis.actionPlan.expectedResults.leads}</strong>
      </div>
    </div>

    <!-- Recomendações -->
    <div class="section">
      <h2>💡 Recomendações Personalizadas</h2>
      
      <h3>🎯 Mix de Conteúdo Ideal:</h3>
      <div class="metric">
        <span>Educativo:</span>
        <strong>${analysis.recommendations.contentMix.educational}%</strong>
      </div>
      <div class="metric">
        <span>Inspiracional:</span>
        <strong>${analysis.recommendations.contentMix.inspirational}%</strong>
      </div>
      <div class="metric">
        <span>Bastidores:</span>
        <strong>${analysis.recommendations.contentMix.behindScenes}%</strong>
      </div>
      <div class="metric">
        <span>Vendas:</span>
        <strong>${analysis.recommendations.contentMix.sales}%</strong>
      </div>
      
      <h3>📝 Ideias Específicas para Ti:</h3>
      <ul class="recommendations">
        ${analysis.recommendations.specificIdeas.map((idea: string) => `<li>💡 ${idea}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p><strong>Relatório gerado pela plataforma LXON</strong></p>
      <p>Este relatório é baseado em análise por IA e dados públicos do Instagram</p>
      <p style="margin-top: 10px;">📧 Precisa de ajuda? Contacta-nos!</p>
    </div>
  </div>
</body>
</html>
  `;
}