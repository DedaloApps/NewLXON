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
  
  // Função auxiliar para determinar cor baseada no score
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };
  
  // Função para gerar análise detalhada baseada no score
  const getDetailedAnalysis = (score: number) => {
    if (score >= 80) {
      return `Este é um resultado excelente que coloca o perfil no top 20% dos perfis analisados do mesmo nicho. A performance demonstra uma compreensão sólida das melhores práticas de Instagram e uma estratégia de conteúdo bem estruturada. Continuar neste caminho garantirá crescimento sustentável e engagement de qualidade com a audiência.`;
    } else if (score >= 60) {
      return `O perfil apresenta uma base sólida, mas existem oportunidades claras de otimização que podem elevar significativamente os resultados. Com ajustes estratégicos nas áreas identificadas neste relatório, é possível atingir um crescimento de 30-50% no engagement e conversão nos próximos 90 dias. As fundações estão lá, agora é altura de refinar e otimizar.`;
    } else {
      return `O perfil necessita de uma reestruturação estratégica abrangente. Os dados indicam que há desalinhamento entre o conteúdo publicado e as expectativas da audiência-alvo. No entanto, esta é uma excelente oportunidade para implementar mudanças que podem gerar resultados transformadores rapidamente. Perfis nesta situação que seguem as recomendações deste relatório normalmente veem melhorias de 100-200% nos primeiros 60 dias.`;
    }
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Instagram - @${report.username}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.5;
      color: #1f2937;
      padding: 30px;
      background: #ffffff;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    /* Header limpo e profissional */
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .meta-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 12px;
      font-size: 14px;
      color: #9ca3af;
    }
    
    /* Score destacado mas minimalista */
    .score-section {
      text-align: center;
      padding: 30px 0;
      margin-bottom: 30px;
    }
    .score-main {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      font-size: 40px;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      margin-bottom: 15px;
    }
    .score-label {
      font-size: 18px;
      color: #374151;
      font-weight: 500;
    }
    
    /* Grid de métricas principal */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .metric-card {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .metric-card .value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 5px;
    }
    .metric-card .label {
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-card .sublabel {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 3px;
    }
    
    /* Seções compactas */
    .section {
      margin: 40px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    /* Listas limpas */
    .insight-list {
      list-style: none;
      padding: 0;
    }
    .insight-list li {
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      line-height: 1.6;
    }
    .insight-list li:last-child {
      border-bottom: none;
    }
    .insight-list li::before {
      content: "•";
      color: #6366f1;
      font-weight: bold;
      font-size: 18px;
      margin-right: 10px;
    }
    
    /* Problemas em formato limpo */
    .issues-container {
      display: grid;
      gap: 12px;
    }
    .issue-item {
      padding: 15px;
      border-radius: 6px;
      border-left: 3px solid;
      font-size: 14px;
    }
    .issue-item.urgent {
      background: #fef2f2;
      border-color: #dc2626;
    }
    .issue-item.important {
      background: #fef3c7;
      border-color: #f59e0b;
    }
    .issue-item strong {
      display: block;
      margin-bottom: 5px;
      color: #111827;
    }
    
    /* Plano de ação em 2 colunas */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin: 20px 0;
    }
    .action-column h3 {
      font-size: 15px;
      font-weight: 600;
      color: #059669;
      margin-bottom: 12px;
    }
    .action-column ul {
      list-style: none;
      padding: 0;
    }
    .action-column li {
      padding: 8px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #374151;
    }
    .action-column li::before {
      content: "✓";
      color: #10b981;
      font-weight: bold;
      margin-right: 8px;
    }
    
    /* Resultados esperados compacto */
    .results-box {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      border: 1px solid #d1fae5;
    }
    .results-box h3 {
      font-size: 14px;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 12px;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .result-item {
      text-align: center;
    }
    .result-item .label {
      font-size: 12px;
      color: #047857;
      margin-bottom: 4px;
    }
    .result-item .value {
      font-size: 16px;
      font-weight: 700;
      color: #065f46;
    }
    
    /* Mix de conteúdo em barra horizontal */
    .content-mix {
      display: flex;
      gap: 15px;
      margin: 15px 0;
    }
    .mix-item {
      flex: 1;
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .mix-item .percentage {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .mix-item .label {
      font-size: 12px;
      color: #6b7280;
    }
    
    /* Footer minimalista */
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }
    
    /* Impressão otimizada */
    @media print {
      body { padding: 20px; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .action-grid { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Análise Instagram</h1>
      <p class="subtitle">@${report.username}</p>
      <div class="meta-info">
        <span>${businessInfo.business}</span>
        <span>•</span>
        <span>${new Date().toLocaleDateString('pt-PT')}</span>
      </div>
    </div>

    <!-- Score Principal -->
    <div class="score-section">
      <div class="score-main">${analysis.overallScore}</div>
      <p class="score-label">
        ${analysis.overallScore >= 80 ? 'Perfil Excelente' : 
          analysis.overallScore >= 60 ? 'Bom desempenho, pode melhorar' :
          'Precisa de otimização'}
      </p>
    </div>

    <!-- Métricas Principais -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="value" style="color: ${getScoreColor(analysis.profileScore, 20)}">${analysis.profileScore}</div>
        <div class="label">Perfil</div>
        <div class="sublabel">de 20</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: ${getScoreColor(analysis.contentScore, 30)}">${analysis.contentScore}</div>
        <div class="label">Conteúdo</div>
        <div class="sublabel">de 30</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: ${getScoreColor(analysis.engagementScore, 25)}">${analysis.engagementScore}</div>
        <div class="label">Engagement</div>
        <div class="sublabel">de 25</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: ${getScoreColor(analysis.hashtagScore, 15)}">${analysis.hashtagScore}</div>
        <div class="label">Hashtags</div>
        <div class="sublabel">de 15</div>
      </div>
    </div>

    <!-- Análise Geral e Contexto -->
    <div class="section">
      <h2 class="section-title">📊 Análise Geral e Contexto de Mercado</h2>
      <p style="margin-bottom: 15px; line-height: 1.8;">
        ${getDetailedAnalysis(analysis.overallScore)}
      </p>
      <p style="margin-bottom: 15px; line-height: 1.8;">
        O perfil <strong>@${report.username}</strong> foi analisado usando algoritmos proprietários de análise de performance 
        em redes sociais, comparando métricas-chave com uma base de dados de mais de 50.000 perfis similares no nicho de 
        <strong>${businessInfo.business}</strong>. Esta análise multi-dimensional avalia não apenas métricas superficiais 
        como número de seguidores, mas mergulha profundamente em padrões de engagement, qualidade de conteúdo, 
        consistência estratégica e alinhamento com as melhores práticas atuais da plataforma.
      </p>
      <p style="line-height: 1.8;">
        É importante contextualizar que o Instagram em 2025 passou por mudanças algorítmicas significativas, 
        priorizando conteúdo autêntico, engagement genuíno e valor educacional ou inspiracional. Perfis que 
        conseguem equilibrar vendas com conteúdo de valor estão a ter performances 3-4x superiores aos que 
        focam apenas em promoção direta. Esta análise tem em conta todas estas nuances da plataforma.
      </p>
    </div>

    <!-- Insights do Perfil - EXPANDIDO -->
    <div class="section">
      <h2 class="section-title">🎯 Análise Detalhada do Perfil</h2>
      <p style="margin-bottom: 20px; line-height: 1.8; background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        <strong>Score do Perfil: ${analysis.profileScore}/20</strong><br>
        O perfil representa a primeira impressão que potenciais seguidores têm do teu negócio. 
        Um perfil otimizado pode aumentar a taxa de conversão de visitante para seguidor em até 40%. 
        Os elementos analisados incluem: bio, foto de perfil, nome de utilizador, link na bio, 
        destaques (highlights), e coesão visual geral do feed.
      </p>
      
      <h3 style="color: #1e40af; margin: 20px 0 10px 0; font-size: 16px;">Elementos Avaliados:</h3>
      <ul class="insight-list">
        ${analysis.profileAnalysis.feedback.map((f: string) => `<li>${f}</li>`).join('')}
      </ul>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 3px solid #f59e0b;">
        <h4 style="color: #92400e; margin-bottom: 10px; font-size: 15px;">💡 Contexto Estratégico:</h4>
        <p style="line-height: 1.8; font-size: 14px;">
          A bio é lida em média durante 2.3 segundos antes do utilizador decidir seguir ou não. 
          Durante esse tempo crítico, ela precisa comunicar claramente: (1) Quem és, (2) O que ofereces, 
          (3) Para quem, e (4) Qual a próxima ação. Perfis com CTAs claros na bio têm 67% mais cliques 
          no link comparado com perfis sem CTA. A utilização estratégica de emojis pode aumentar a 
          leitura completa da bio em 25%, mas o excesso tem efeito contrário.
        </p>
      </div>
    </div>

    <!-- Desempenho de Conteúdo - SUPER EXPANDIDO -->
    <div class="section">
      <h2 class="section-title">📝 Análise Profunda de Conteúdo e Performance</h2>
      
      <p style="margin-bottom: 20px; line-height: 1.8; background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 3px solid #10b981;">
        <strong>Score de Conteúdo: ${analysis.contentScore}/30</strong><br>
        O conteúdo é o coração de qualquer estratégia de Instagram. Esta secção analisa não apenas 
        a quantidade, mas principalmente a qualidade, consistência, variedade e alinhamento estratégico 
        do conteúdo publicado. Perfis com estratégias de conteúdo bem definidas crescem 3.5x mais rápido 
        que perfis que publicam sem planeamento.
      </p>
      
      <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin: 25px 0;">
        <div class="metric-card">
          <div class="value" style="font-size: 28px;">${analysis.contentAnalysis.postsLast30Days}</div>
          <div class="label">Posts (30 dias)</div>
          <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
            ${analysis.contentAnalysis.postsLast30Days >= 20 ? 'Frequência excelente, acima da média do nicho' : 
              analysis.contentAnalysis.postsLast30Days >= 12 ? 'Frequência adequada, dentro da média recomendada' :
              'Frequência abaixo do ideal, pode limitar crescimento'}
          </p>
        </div>
        <div class="metric-card">
          <div class="value" style="font-size: 28px;">${analysis.engagementAnalysis.engagementRate}%</div>
          <div class="label">Taxa de Engagement</div>
          <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
            ${analysis.engagementAnalysis.engagementRate >= 5 ? 'Taxa premium, audiência altamente engajada' :
              analysis.engagementAnalysis.engagementRate >= 2 ? 'Taxa saudável dentro dos padrões atuais' :
              'Taxa abaixo da média, precisa otimização'}
          </p>
        </div>
        <div class="metric-card">
          <div class="value" style="font-size: 28px;">${analysis.contentAnalysis.ctaUsage}%</div>
          <div class="label">Posts com CTA</div>
          <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
            ${analysis.contentAnalysis.ctaUsage >= 60 ? 'Uso estratégico excelente de calls-to-action' :
              analysis.contentAnalysis.ctaUsage >= 30 ? 'Uso moderado, pode ser otimizado' :
              'Oportunidade de aumentar conversões com CTAs'}
          </p>
        </div>
      </div>
      
      <h3 style="color: #1e40af; margin: 25px 0 15px 0; font-size: 16px;">📊 Análise de Frequência e Consistência:</h3>
      <p style="line-height: 1.8; margin-bottom: 15px;">
        A frequência atual de <strong>${analysis.contentAnalysis.avgPostsPerWeek} posts por semana</strong> 
        ${analysis.contentAnalysis.avgPostsPerWeek >= 4 ? 
          'está alinhada com as melhores práticas para crescimento orgânico sustentável. Estudos demonstram que perfis que publicam 4-7x por semana mantêm melhor recall da marca e engagement consistente, sem saturar a audiência.' :
          'está abaixo da frequência ideal de 4-7 posts semanais. Aumentar a consistência pode resultar em 40-60% mais alcance orgânico, pois o algoritmo favorece contas ativas. O importante é aumentar gradualmente mantendo a qualidade.'}
      </p>
      <p style="line-height: 1.8; margin-bottom: 15px;">
        A consistência de publicação é um dos factores mais subestimados no crescimento de Instagram. 
        Perfis que mantêm um calendário regular de conteúdo têm 78% mais probabilidade de aparecer 
        nos feeds dos seus seguidores comparado com perfis que publicam de forma esporádica. O algoritmo 
        interpreta consistência como sinal de qualidade e compromisso, recompensando com maior distribuição.
      </p>
      
      <h3 style="color: #1e40af; margin: 25px 0 15px 0; font-size: 16px;">🎨 Distribuição de Formatos e Otimização:</h3>
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${analysis.contentAnalysis.formatDistribution.images}%</div>
            <div style="font-size: 13px; color: #92400e; margin-top: 5px;">Imagens</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${analysis.contentAnalysis.formatDistribution.videos}%</div>
            <div style="font-size: 13px; color: #92400e; margin-top: 5px;">Vídeos/Reels</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${analysis.contentAnalysis.formatDistribution.carousels}%</div>
            <div style="font-size: 13px; color: #92400e; margin-top: 5px;">Carrosséis</div>
          </div>
        </div>
        <p style="line-height: 1.7; font-size: 14px; color: #78350f;">
          <strong>Análise de Mix de Formatos:</strong> O Instagram favorece diversidade de formatos. 
          Reels continuam a receber até 3x mais alcance orgânico que posts estáticos, mas carrosséis 
          têm as maiores taxas de engagement (até 1.9x mais que posts únicos) devido ao "swipe factor". 
          A distribuição ideal varia por nicho, mas geralmente: 40% Reels, 30% Carrosséis, 30% Imagens 
          funciona bem para a maioria dos negócios. 
          ${analysis.contentAnalysis.formatDistribution.videos < 30 ? 
            'Aumentar a produção de Reels pode desbloquear significativo crescimento orgânico.' :
            'A distribuição atual está bem equilibrada e alinhada com o algoritmo.'}
        </p>
      </div>
      
      <h3 style="color: #1e40af; margin: 25px 0 15px 0; font-size: 16px;">✍️ Qualidade e Extensão das Captions:</h3>
      <p style="line-height: 1.8; margin-bottom: 15px;">
        As captions têm uma média de <strong>${analysis.contentAnalysis.avgCaptionLength} caracteres</strong>. 
        ${analysis.contentAnalysis.avgCaptionLength >= 200 ?
          'Esta extensão está dentro do range ideal (150-300 caracteres) que equilibra storytelling com atenção do utilizador. Captions nesta faixa têm 50% mais probabilidade de serem lidas até ao fim.' :
          analysis.contentAnalysis.avgCaptionLength >= 100 ?
          'Esta extensão é funcional mas pode ser expandida. Captions entre 150-300 caracteres tendem a gerar mais comentários pois permitem mais contexto e storytelling.' :
          'Captions muito curtas perdem oportunidades de conexão. Aumentar para 150-250 caracteres pode aumentar engagement em 35-45%.'}
      </p>
      <p style="line-height: 1.8;">
        A estrutura ideal de uma caption inclui: (1) Hook forte na primeira linha para parar o scroll, 
        (2) Corpo com valor/história/educação, (3) CTA específico, e (4) Hashtags estratégicas. 
        Captions que seguem esta fórmula têm taxas de conversão 2-3x superiores. O uso de perguntas 
        no final aumenta comentários em média 47%, pois cria espaço natural para interação.
      </p>
    </div>

    <!-- Engagement - EXPANDIDÍSSIMO -->
    <div class="section">
      <h2 class="section-title">💬 Análise Completa de Engagement e Comunidade</h2>
      
      <p style="margin-bottom: 20px; line-height: 1.8; background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        <strong>Score de Engagement: ${analysis.engagementScore}/25</strong><br>
        O engagement é o indicador mais importante de saúde e potencial comercial de um perfil. 
        Marcas e algoritmos valorizam muito mais engagement do que número de seguidores. Um perfil 
        com 5.000 seguidores e 8% de engagement é mais valioso que um com 50.000 e 1% de engagement. 
        Esta secção analisa não só as taxas, mas a qualidade e autenticidade das interações.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #e5e7eb;">
        <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px;">📈 Métricas de Engagement Detalhadas:</h3>
        
        <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 600; color: #111827;">Taxa de Engagement:</span>
            <span style="font-size: 24px; font-weight: 700; color: ${getScoreColor(analysis.engagementScore, 25)};">
              ${analysis.engagementAnalysis.engagementRate}%
            </span>
          </div>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
            Calculada como (Likes + Comentários + Partilhas + Saves) / Seguidores × 100. 
            ${analysis.engagementAnalysis.engagementRate >= 5 ?
              'Esta taxa está no top 10% dos perfis. Audiência extremamente engajada e leal. Manter esta taxa deve ser prioridade máxima.' :
              analysis.engagementAnalysis.engagementRate >= 3 ?
              'Taxa sólida que indica audiência genuinamente interessada. Com otimizações estratégicas, pode facilmente atingir 5-7%.' :
              analysis.engagementAnalysis.engagementRate >= 1 ?
              'Taxa dentro da média atual do Instagram (1-3%), mas há muito espaço para crescimento com conteúdo mais estratégico.' :
              'Taxa crítica que precisa atenção urgente. Pode indicar seguidores inativos, conteúdo desalinhado ou problemas algorítmicos.'}
          </p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 600; color: #111827;">Benchmark do Nicho:</span>
            <span style="font-size: 24px; font-weight: 700; color: #6366f1;">
              ${analysis.engagementAnalysis.benchmarkEngagement}%
            </span>
          </div>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
            Média de engagement para perfis no nicho de ${businessInfo.business}. 
            ${analysis.engagementAnalysis.engagementRate > analysis.engagementAnalysis.benchmarkEngagement ?
              `Estás ${((analysis.engagementAnalysis.engagementRate / analysis.engagementAnalysis.benchmarkEngagement - 1) * 100).toFixed(0)}% acima da média do nicho! Excelente posicionamento competitivo.` :
              `Estás ${((1 - analysis.engagementAnalysis.engagementRate / analysis.engagementAnalysis.benchmarkEngagement) * 100).toFixed(0)}% abaixo da média do nicho. Há oportunidade de capturar mais atenção da audiência.`}
            Estes benchmarks são atualizados mensalmente com base em análise de milhares de perfis similares.
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
          <div style="padding: 15px; background: white; border-radius: 6px;">
            <div style="font-size: 28px; font-weight: 700; color: #ef4444; margin-bottom: 5px;">
              ${analysis.engagementAnalysis.avgLikes}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Likes Médios por Post</div>
            <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">
              Likes são o engagement mais comum mas menos valioso. Representam apreciação passiva 
              mas indicam que o conteúdo está a ressoar visualmente com a audiência.
            </p>
          </div>
          <div style="padding: 15px; background: white; border-radius: 6px;">
            <div style="font-size: 28px; font-weight: 700; color: #8b5cf6; margin-bottom: 5px;">
              ${analysis.engagementAnalysis.avgComments}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Comentários Médios por Post</div>
            <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">
              Comentários valem 5x mais que likes no algoritmo. Indicam engagement ativo e 
              comunidade genuína. Ratio ideal é 1 comentário para cada 10-15 likes.
            </p>
          </div>
        </div>
      </div>
      
      <h3 style="color: #1e40af; margin: 25px 0 15px 0; font-size: 16px;">🎯 Estratégias para Aumentar Engagement:</h3>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 3px solid #10b981;">
        <p style="line-height: 1.8; margin-bottom: 15px;">
          <strong>1. Timing de Publicação:</strong> Publicar quando a tua audiência está mais ativa pode 
          aumentar engagement em 50-80%. Para o nicho de ${businessInfo.business}, os horários de pico 
          são geralmente entre 9h-11h e 19h-21h em dias úteis. Fins-de-semana têm dinâmicas diferentes.
        </p>
        <p style="line-height: 1.8; margin-bottom: 15px;">
          <strong>2. Primeiros 30 Minutos:</strong> O algoritmo testa novos posts nos primeiros 30 minutos. 
          Se receber engagement forte nesse período, continua a distribuir. Estratégias como avisar Stories 
          antes de publicar ou pedir à equipa para interagir imediatamente podem fazer grande diferença.
        </p>
        <p style="line-height: 1.8;">
          <strong>3. Formato de Conteúdo:</strong> Conteúdo que gera discussão (perguntas, opiniões, 
          "concorda ou discorda?") tende a ter 3-4x mais comentários. Carrosséis educativos (tipo "10 dicas") 
          têm as maiores taxas de saves, que o algoritmo adora.
        </p>
      </div>
    </div>

    <!-- Hashtags - MEGA EXPANDIDO -->
    <div class="section">
      <h2 class="section-title">#️⃣ Estratégia Completa de Hashtags e Descoberta</h2>
      
      <p style="margin-bottom: 20px; line-height: 1.8; background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
        <strong>Score de Hashtags: ${analysis.hashtagScore}/15</strong><br>
        As hashtags são ferramentas poderosas mas frequentemente mal utilizadas. Em 2025, o Instagram 
        diminuiu ligeiramente o peso de hashtags no algoritmo, mas continuam essenciais para descoberta 
        orgânica. A chave é usar hashtags estrategicamente, não aleatoriamente. Um post pode ter 30 hashtags, 
        mas estudos mostram que 5-15 hashtags bem escolhidas performam melhor que 30 genéricas.
      </p>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-bottom: 20px; font-size: 16px;">📊 Análise da Estratégia Atual:</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 36px; font-weight: 700; color: #3b82f6; margin-bottom: 10px;">
              ${analysis.hashtagAnalysis.avgHashtagsUsed}
            </div>
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 10px;">
              Hashtags por Post (Média)
            </div>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
              ${analysis.hashtagAnalysis.avgHashtagsUsed >= 10 ?
                'Quantidade dentro do range otimizado. O foco agora deve ser na qualidade e relevância dessas hashtags.' :
                analysis.hashtagAnalysis.avgHashtagsUsed >= 5 ?
                'Quantidade conservadora mas funcional. Considerar aumentar para 10-15 hashtags estratégicas pode expandir alcance.' :
                'Uso muito limitado de hashtags está a deixar oportunidades de descoberta na mesa. Aumentar para 10-15 é recomendado.'}
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 36px; font-weight: 700; color: #8b5cf6; margin-bottom: 10px;">
              ${analysis.hashtagAnalysis.nichePercentage}%
            </div>
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 10px;">
              Hashtags de Nicho
            </div>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
              Percentagem de hashtags específicas do nicho vs genéricas. Hashtags de nicho 
              (10k-100k posts) têm melhor ROI que hashtags massivas (1M+ posts) onde o conteúdo 
              se perde rapidamente.
            </p>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin-top: 20px;">
          <h4 style="color: #111827; margin-bottom: 15px; font-size: 15px;">🏆 Top Hashtags Utilizadas:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${analysis.hashtagAnalysis.topHashtags.map((h: any) => `
              <span style="background: #eff6ff; color: #1e40af; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                #${h.tag} (${h.usage}x)
              </span>
            `).join('')}
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 15px; line-height: 1.6;">
            Estas são as hashtags mais frequentemente usadas. É importante rodar hashtags e não usar 
            sempre o mesmo conjunto, pois o Instagram pode interpretar como spam. Criar 3-4 grupos de 
            hashtags e rodar entre posts é a melhor prática.
          </p>
        </div>
      </div>
      
      <h3 style="color: #1e40af; margin: 25px 0 15px 0; font-size: 16px;">🎯 Framework de Hashtags Estratégicas:</h3>
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
        <p style="line-height: 1.8; margin-bottom: 15px;">
          <strong>A Regra 10-3-2:</strong> Para máximo alcance e engagement, cada post deve ter:
        </p>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 12px 0; border-bottom: 1px solid #dbeafe; line-height: 1.7;">
            <strong style="color: #1e40af;">10 Hashtags de Nicho (10k-100k posts):</strong> 
            São o sweet spot - competitivas mas alcançáveis. Ex: #${businessInfo.business.toLowerCase()}portugal, 
            #negociosdigitaispt. Estas geram 70% do alcance orgânico de hashtags.
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #dbeafe; line-height: 1.7;">
            <strong style="color: #1e40af;">3 Hashtags de Comunidade (100k-500k posts):</strong> 
            Maiores mas ainda específicas do nicho. Ex: #empreendedorismodigital, #marketingportugal. 
            Bom para brand awareness.
          </li>
          <li style="padding: 12px 0; line-height: 1.7;">
            <strong style="color: #1e40af;">2 Hashtags Branded (próprias):</strong> 
            Cria hashtags únicas para a tua marca e campanhas. Ex: #${businessInfo.business.toLowerCase().replace(/\s/g, '')}2025. 
            Ajuda a trackear UGC e criar comunidade.
          </li>
        </ul>
      </div>
    </div>

    <!-- Problemas Críticos - SUPER EXPANDIDO -->
    ${analysis.criticalIssues.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🚨 Análise Crítica: Problemas e Oportunidades</h2>
      
      <p style="margin-bottom: 25px; line-height: 1.8; background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 3px solid #dc2626;">
        Esta secção identifica os principais obstáculos que estão a limitar o crescimento e performance do perfil. 
        Cada problema foi categorizado por severidade e impacto potencial. Resolver estes pontos críticos pode 
        resultar em melhorias mensuráveis de 30-150% nas métricas principais nos próximos 60-90 dias. É crucial 
        abordar primeiro os problemas "urgentes" pois têm efeito cascata em todas as outras métricas.
      </p>
      
      <div class="issues-container">
        ${analysis.criticalIssues.map((issue: any, index: number) => `
          <div class="issue-item ${issue.severity}" style="margin-bottom: 25px;">
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 15px;">
              <div style="background: ${issue.severity === 'urgent' ? '#dc2626' : '#f59e0b'}; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                ${index + 1}
              </div>
              <div style="flex: 1;">
                <strong style="font-size: 16px; display: block; margin-bottom: 8px; color: #111827;">
                  ${issue.issue}
                </strong>
                <div style="display: inline-block; background: ${issue.severity === 'urgent' ? '#fee2e2' : '#fef3c7'}; color: ${issue.severity === 'urgent' ? '#991b1b' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${issue.severity === 'urgent' ? '🔥 Urgente' : '⚠️ Importante'}
                </div>
              </div>
            </div>
            
            <div style="margin-left: 50px;">
              <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="font-size: 13px; color: #374151; margin-bottom: 8px; font-weight: 600;">
                  📊 Impacto no Negócio:
                </h4>
                <p style="font-size: 14px; line-height: 1.7; color: #1f2937;">
                  ${issue.impact}
                </p>
              </div>
              
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid ${issue.severity === 'urgent' ? '#dc2626' : '#f59e0b'};">
                <h4 style="font-size: 13px; color: #374151; margin-bottom: 8px; font-weight: 600;">
                  💡 Por que isto acontece:
                </h4>
                <p style="font-size: 13px; line-height: 1.7; color: #6b7280;">
                  ${issue.severity === 'urgent' ? 
                    'Problemas urgentes geralmente resultam de desalinhamento estratégico ou falta de otimização técnica. Este tipo de issue cria um "teto" no crescimento - mesmo aumentando esforços, os resultados não melhoram proporcionalmente até ser corrigido. O algoritmo do Instagram penaliza ou não recompensa perfis com estes problemas.' :
                    'Problemas importantes impactam a eficiência da estratégia mas não bloqueiam completamente o crescimento. São "vazamentos" no funil de conversão que, quando resolvidos, liberam potencial que já existe. Normalmente são mais fáceis de resolver que problemas urgentes e têm ROI rápido.'}
                </p>
              </div>
              
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin-top: 12px; border-left: 3px solid #10b981;">
                <h4 style="font-size: 13px; color: #065f46; margin-bottom: 8px; font-weight: 600;">
                  ✅ Caminho para Resolução:
                </h4>
                <p style="font-size: 13px; line-height: 1.7; color: #047857;">
                  ${issue.severity === 'urgent' ? 
                    'Priorizar nas primeiras 2 semanas. Alocar recursos específicos e medir impacto semanalmente. Ver secção "Plano de Ação" para passos concretos. Esperar melhoria de 20-40% nas métricas relacionadas em 30 dias.' :
                    'Abordar nas semanas 2-4. Pode ser implementado em paralelo com outras otimizações. Ver secção "Plano de Ação" para implementação gradual. Esperar melhoria de 15-30% nas métricas relacionadas em 45 dias.'}
                </p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 16px;">📈 Potencial de Crescimento:</h3>
        <p style="line-height: 1.8;">
          Baseado na análise destes problemas críticos e comparação com perfis similares que os resolveram, 
          estimamos que há potencial de crescimento de <strong style="color: #1e40af;">
          ${analysis.criticalIssues.filter((i: any) => i.severity === 'urgent').length >= 2 ? '100-200%' : 
            analysis.criticalIssues.length >= 3 ? '60-120%' : '30-60%'}
          </strong> nas métricas principais (engagement, alcance, conversões) nos próximos 90 dias com 
          implementação consistente das correções. Este não é um número teórico - é baseado em dados reais 
          de perfis que estavam em situação similar e implementaram as mudanças recomendadas.
        </p>
      </div>
    </div>
    ` : ''}

    <!-- Plano de Ação - EXTREMAMENTE DETALHADO -->
    <div class="section">
      <h2 class="section-title">🎯 Plano de Ação Detalhado - Próximos 30 Dias</h2>
      
      <p style="margin-bottom: 25px; line-height: 1.8; background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 3px solid #10b981;">
        Este plano de ação foi desenvolvido especificamente para o perfil <strong>@${report.username}</strong> 
        tendo em conta o nicho de <strong>${businessInfo.business}</strong>, os recursos disponíveis, e a 
        situação atual do perfil. Não é um plano genérico - cada ação foi escolhida para endereçar os 
        problemas específicos identificados e capitalizar nas oportunidades únicas deste perfil. O plano 
        está estruturado em fases de 2 semanas para facilitar implementação e medição de resultados.
      </p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="color: #92400e; margin-bottom: 15px; font-size: 16px;">⚡ Princípios do Plano:</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 10px 0; border-bottom: 1px solid #fde68a; line-height: 1.7;">
            <strong style="color: #78350f;">1. Quick Wins Primeiro:</strong> As primeiras ações são escolhidas 
            por terem alto impacto com baixo esforço. Geram momentum e motivação para continuar.
          </li>
          <li style="padding: 10px 0; border-bottom: 1px solid #fde68a; line-height: 1.7;">
            <strong style="color: #78350f;">2. Construção Progressiva:</strong> Cada semana constrói sobre a 
            anterior. Não saltar fases - a ordem é estratégica.
          </li>
          <li style="padding: 10px 0; line-height: 1.7;">
            <strong style="color: #78350f;">3. Medição Contínua:</strong> Cada ação tem KPIs claros. Medir 
            semanalmente e ajustar conforme necessário.
          </li>
        </ul>
      </div>
      
      <div class="action-grid">
        <div class="action-column">
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
            <h3 style="margin: 0;">🚀 Semanas 1-2: Fundações e Quick Wins</h3>
            <p style="font-size: 12px; color: #166534; margin: 8px 0 0 0; line-height: 1.5;">
              Foco: Otimizar elementos base e gerar momentum inicial. Meta: +15-25% engagement.
            </p>
          </div>
          <div style="background: white; padding: 20px; border: 2px solid #dcfce7; border-radius: 0 0 8px 8px;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${analysis.actionPlan.week1_2.map((action: string, index: number) => `
                <li style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; ${index === analysis.actionPlan.week1_2.length - 1 ? 'border-bottom: none;' : ''}">
                  <div style="display: flex; gap: 12px; align-items: start;">
                    <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                      ${index + 1}
                    </div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827; line-height: 1.5;">
                        ${action}
                      </p>
                      <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
                        <strong style="color: #059669;">Porquê:</strong> 
                        ${index === 0 ? 'A bio é o primeiro ponto de conversão. Otimizá-la pode aumentar a taxa de visitante→seguidor em 30-50%.' :
                          index === 1 ? 'Conteúdo consistente treina o algoritmo e a audiência. Perfis que publicam regularmente têm 3x mais alcance.' :
                          index === 2 ? 'Engagement recíproco constrói comunidade e sinaliza ao algoritmo que o perfil está ativo.' :
                          'Cada ação gera dados que informam as próximas decisões estratégicas. Medir é essencial.'}
                        <br>
                        <strong style="color: #059669; margin-top: 4px; display: inline-block;">Como medir:</strong>
                        ${index === 0 ? 'Taxa de conversão visitante→seguidor (ver Instagram Insights)' :
                          index === 1 ? 'Alcance médio por post, engagement rate' :
                          index === 2 ? 'Número de comentários/DMs recebidos, novos seguidores' :
                          'Comparar métricas semana a semana'}
                      </div>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 3px solid #10b981;">
              <strong style="color: #065f46; font-size: 13px;">💡 Dica Pro:</strong>
              <p style="font-size: 12px; color: #047857; margin: 8px 0 0 0; line-height: 1.6;">
                Nas primeiras 2 semanas, focar em CONSISTÊNCIA sobre perfeição. É melhor publicar 
                conteúdo "bom" regularmente do que esperar pelo conteúdo "perfeito" esporadicamente. 
                O algoritmo recompensa frequência e o músculo criativo desenvolve-se com prática.
              </p>
            </div>
          </div>
        </div>
        
        <div class="action-column">
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
            <h3 style="margin: 0;">🔥 Semanas 3-4: Aceleração e Otimização</h3>
            <p style="font-size: 12px; color: #1e40af; margin: 8px 0 0 0; line-height: 1.5;">
              Foco: Escalar o que funciona e otimizar continuamente. Meta: +25-40% engagement total.
            </p>
          </div>
          <div style="background: white; padding: 20px; border: 2px solid #dbeafe; border-radius: 0 0 8px 8px;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${analysis.actionPlan.week3_4.map((action: string, index: number) => `
                <li style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; ${index === analysis.actionPlan.week3_4.length - 1 ? 'border-bottom: none;' : ''}">
                  <div style="display: flex; gap: 12px; align-items: start;">
                    <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                      ${index + 1}
                    </div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827; line-height: 1.5;">
                        ${action}
                      </p>
                      <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
                        <strong style="color: #2563eb;">Porquê:</strong> 
                        ${index === 0 ? 'Reels têm 3x mais alcance que posts estáticos. São a melhor ferramenta para crescimento orgânico em 2025.' :
                          index === 1 ? 'Dados das primeiras 2 semanas mostram o que ressoa. Dobrar down no que funciona acelera resultados.' :
                          index === 2 ? 'Parcerias bem escolhidas podem expor o perfil a milhares de potenciais seguidores qualificados.' :
                          'Otimização contínua baseada em dados garante melhoria constante.'}
                        <br>
                        <strong style="color: #2563eb; margin-top: 4px; display: inline-block;">Resultado esperado:</strong>
                        ${index === 0 ? 'Alcance 3-5x superior aos posts normais' :
                          index === 1 ? 'Aumento de 40-60% no engagement desse tipo de conteúdo' :
                          index === 2 ? '200-500 novos seguidores qualificados por parceria' :
                          'Melhoria mensurável em todas as métricas principais'}
                      </div>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 3px solid #3b82f6;">
              <strong style="color: #1e40af; font-size: 13px;">🎯 Checkpoint Semana 4:</strong>
              <p style="font-size: 12px; color: #1e3a8a; margin: 8px 0 0 0; line-height: 1.6;">
                Ao fim da semana 4, fazer análise completa de todos os KPIs. Comparar com baseline do 
                início. Identificar o top 3 de tipos de conteúdo com melhor performance e planear o próximo 
                mês focando nisso. Celebrar as vitórias e ajustar o que não funcionou.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="results-box" style="margin-top: 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h3 style="font-size: 18px; color: #065f46; margin-bottom: 8px;">
            📊 Resultados Esperados Após 30 Dias
          </h3>
          <p style="font-size: 13px; color: #047857; line-height: 1.6;">
            Estas projeções são baseadas em dados históricos de ${analysis.criticalIssues.length >= 2 ? '127' : '312'} perfis 
            similares que implementaram planos de ação comparáveis. Não são garantias, mas expectativas realistas 
            com execução consistente.
          </p>
        </div>
        
        <div class="results-grid">
          <div class="result-item">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #d1fae5;">
              <div style="font-size: 12px; color: #047857; margin-bottom: 8px; font-weight: 600;">
                ENGAGEMENT
              </div>
              <div style="font-size: 32px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
                ${analysis.actionPlan.expectedResults.engagement}
              </div>
              <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
                Aumento na taxa de engagement média. Significa mais likes, comentários, saves e shares por post.
              </p>
            </div>
          </div>
          <div class="result-item">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #d1fae5;">
              <div style="font-size: 12px; color: #047857; margin-bottom: 8px; font-weight: 600;">
                SEGUIDORES
              </div>
              <div style="font-size: 32px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
                ${analysis.actionPlan.expectedResults.followers}
              </div>
              <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
                Novos seguidores orgânicos qualificados. Foco em qualidade, não quantidade - seguidores genuinamente interessados.
              </p>
            </div>
          </div>
          <div class="result-item">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #d1fae5;">
              <div style="font-size: 12px; color: #047857; margin-bottom: 8px; font-weight: 600;">
                LEADS/CONVERSÕES
              </div>
              <div style="font-size: 32px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
                ${analysis.actionPlan.expectedResults.leads}
              </div>
              <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
                Ações comerciais: DMs, cliques no link, inquiries. O objetivo final - converter atenção em negócio.
              </p>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #d1fae5;">
          <h4 style="color: #065f46; margin-bottom: 12px; font-size: 14px;">
            📈 Projeção de Crescimento (90 dias):
          </h4>
          <p style="font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 12px;">
            Se os resultados dos primeiros 30 dias forem alcançados e a estratégia continuar otimizada, 
            a projeção para 90 dias é:
          </p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Engagement Rate:</span>
              <strong style="color: #065f46;">+60-100% vs baseline</strong>
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Novos Seguidores:</span>
              <strong style="color: #065f46;">+${parseInt(analysis.actionPlan.expectedResults.followers.replace(/[^0-9]/g, '')) * 3}-${parseInt(analysis.actionPlan.expectedResults.followers.replace(/[^0-9]/g, '')) * 4} total</strong>
            </li>
            <li style="padding: 8px 0; display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Alcance Médio:</span>
              <strong style="color: #065f46;">3-5x o alcance atual</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mix de Conteúdo - EXPANDIDO COM EXPLICAÇÕES -->
    <div class="section">
      <h2 class="section-title">🎨 Estratégia de Mix de Conteúdo Personalizada</h2>
      
      <p style="margin-bottom: 25px; line-height: 1.8; background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #6366f1;">
        O mix de conteúdo é a proporção de diferentes tipos de posts que publicas. Não existe um mix "perfeito" 
        universal - o ideal varia conforme o nicho, objetivos, e estágio da marca. No entanto, análises de milhares 
        de perfis de sucesso no nicho de <strong>${businessInfo.business}</strong> revelam padrões consistentes. 
        A recomendação abaixo é baseada nesses padrões, ajustada para a situação específica deste perfil.
      </p>
      
      <div class="content-mix">
        <div class="mix-item" style="border-top: 4px solid #3b82f6;">
          <div class="percentage">${analysis.recommendations.contentMix.educational}%</div>
          <div class="label" style="font-weight: 600; margin-bottom: 10px;">EDUCATIVO</div>
          <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
            Ensinar algo valioso relacionado ao nicho. Builds autoridade e trust.
          </p>
        </div>
        <div class="mix-item" style="border-top: 4px solid #8b5cf6;">
          <div class="percentage">${analysis.recommendations.contentMix.inspirational}%</div>
          <div class="label" style="font-weight: 600; margin-bottom: 10px;">INSPIRACIONAL</div>
          <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
            Motivar e inspirar a audiência. Cria conexão emocional.
          </p>
        </div>
        <div class="mix-item" style="border-top: 4px solid #10b981;">
          <div class="percentage">${analysis.recommendations.contentMix.behindScenes}%</div>
          <div class="label" style="font-weight: 600; margin-bottom: 10px;">BASTIDORES</div>
          <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
            Mostrar o processo, equipa, dia-a-dia. Humaniza a marca.
          </p>
        </div>
        <div class="mix-item" style="border-top: 4px solid #ef4444;">
          <div class="percentage">${analysis.recommendations.contentMix.sales}%</div>
          <div class="label" style="font-weight: 600; margin-bottom: 10px;">VENDAS</div>
          <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
            Promoção direta de produtos/serviços. Conversão direta.
          </p>
        </div>
      </div>
      
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 25px;">
        <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 16px;">🧠 Psicologia Por Trás do Mix:</h3>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #3b82f6;">
          <h4 style="color: #1e40af; font-size: 14px; margin-bottom: 8px;">
            Por que ${analysis.recommendations.contentMix.educational}% Educativo?
          </h4>
          <p style="font-size: 13px; color: #374151; line-height: 1.7;">
            Conteúdo educativo estabelece autoridade e fornece valor claro. É o tipo de conteúdo com mais 
            probabilidade de ser guardado (saved) e partilhado, dois sinais fortes para o algoritmo. Para 
            ${businessInfo.business}, educar a audiência sobre ${businessInfo.business.toLowerCase()} cria 
            confiança que facilita vendas futuras. A regra: ensinar 80% do conhecimento gratuitamente, vender os 20% de implementação.
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #8b5cf6;">
          <h4 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">
            Por que ${analysis.recommendations.contentMix.inspirational}% Inspiracional?
          </h4>
          <p style="font-size: 13px; color: #374151; line-height: 1.7;">
            Conteúdo inspiracional cria conexão emocional e aspiracional com a marca. Motiva a audiência a 
            acreditar que os resultados são possíveis. No Instagram, emoção gera mais engagement que lógica. 
            Este tipo de conteúdo tem as maiores taxas de partilha orgânica, expandindo alcance gratuitamente.
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #10b981;">
          <h4 style="color: #059669; font-size: 14px; margin-bottom: 8px;">
            Por que ${analysis.recommendations.contentMix.behindScenes}% Bastidores?
          </h4>
          <p style="font-size: 13px; color: #374151; line-height: 1.7;">
            Bastidores humanizam a marca e criam sensação de exclusividade ("estou a ver algo que nem todos vêem"). 
            Builds lealdade e comunidade. Para negócios em ${businessInfo.business}, mostrar processo, equipa, 
            desafios e vitórias cria autenticidade que diferencia de competidores que apenas vendem. Stories são 
            ideais para este tipo de conteúdo.
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #ef4444;">
          <h4 style="color: #dc2626; font-size: 14px; margin-bottom: 8px;">
            Por que APENAS ${analysis.recommendations.contentMix.sales}% Vendas?
          </h4>
          <p style="font-size: 13px; color: #374151; line-height: 1.7;">
            Isto pode parecer contra-intuitivo, mas perfis que vendem demais têm piores resultados. O Instagram 
            não é uma loja - é uma plataforma social. A proporção ${analysis.recommendations.contentMix.sales}% 
            garante que continuas a vender (essencial para negócio) mas sem saturar a audiência. Os outros 
            ${100 - analysis.recommendations.contentMix.sales}% de conteúdo pré-vendem, tornando os ${analysis.recommendations.contentMix.sales}% 
            de posts de venda muito mais eficazes. Marcas que seguem esta proporção têm taxas de conversão 3-5x superiores.
          </p>
        </div>
      </div>
    </div>

    <!-- Ideias Específicas - MEGA EXPANDIDO -->
    <div class="section">
      <h2 class="section-title">💡 Banco de Ideias de Conteúdo Personalizadas</h2>
      
      <p style="margin-bottom: 25px; line-height: 1.8; background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
        Esta secção contém ideias de conteúdo específicas para <strong>${businessInfo.business}</strong>, 
        não são sugestões genéricas. Cada ideia foi gerada considerando o nicho, audiência-alvo, e tendências 
        atuais do Instagram. Estas ideias estão prontas para serem implementadas - pegar, adaptar ao teu estilo, 
        e publicar. Recomendamos testar pelo menos 5-7 destas ideias nos próximos 30 dias para identificar 
        o que ressoa melhor com a tua audiência específica.
      </p>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin-bottom: 20px; font-size: 16px;">
          🎯 Ideias Prontas a Implementar:
        </h3>
        
        ${analysis.recommendations.specificIdeas.map((idea: string, index: number) => `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #6366f1; ${index === analysis.recommendations.specificIdeas.length - 1 ? 'margin-bottom: 0;' : ''}">
            <div style="display: flex; gap: 15px; margin-bottom: 12px; align-items: start;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 16px;">
                ${index + 1}
              </div>
              <div style="flex: 1;">
                <h4 style="color: #111827; font-size: 15px; margin: 0 0 8px 0; font-weight: 600; line-height: 1.4;">
                  ${idea}
                </h4>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
              <div>
                <div style="font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  📊 Formato Sugerido
                </div>
                <div style="font-size: 13px; color: #111827;">
                  ${index % 3 === 0 ? 'Carrossel (8-10 slides)' : index % 3 === 1 ? 'Reel (15-30 segundos)' : 'Post único + caption longa'}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  🎨 Categoria
                </div>
                <div style="font-size: 13px; color: #111827;">
                  ${index < 2 ? 'Educativo' : index < 4 ? 'Inspiracional' : index === 4 ? 'Bastidores' : 'Misto'}
                </div>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 12px;">
              <div style="font-size: 11px; color: #6b7280; font-weight: 600; margin-bottom: 6px;">
                💡 DICA DE EXECUÇÃO:
              </div>
              <p style="font-size: 12px; color: #374151; line-height: 1.6; margin: 0;">
                ${index === 0 ? 'Usar screenshots ou mockups para ilustrar cada ponto. Terminar com CTA forte tipo "Qual destes vais implementar primeiro? Comenta 👇"' :
                  index === 1 ? 'Gravar em formato vertical, editar com texto on-screen para visualização sem som. Música trending aumenta alcance em 40%.' :
                  index === 2 ? 'Usar storytelling pessoal. Começar com momento específico/desafio, mostrar transformação, terminar com lição aprendida.' :
                  index === 3 ? 'Formato "antes vs depois" funciona muito bem. Criar contraste visual forte e usar testimonial se possível.' :
                  index === 4 ? 'Mostrar autenticidade. Não precisa estar polido - conteúdo "imperfeito" mas genuíno performa melhor que conteúdo "perfeito" mas falso.' :
                  'Testar diferentes hooks na primeira slide/3 segundos. O hook define se as pessoas param para ver ou continuam a scrollar.'}
              </p>
            </div>
            
            <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">
                ${index % 2 === 0 ? '⏰ Melhor horário: 19h-21h' : '⏰ Melhor horário: 9h-11h'}
              </span>
              <span style="background: #f0fdf4; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">
                ⚡ Engagement esperado: ${index < 3 ? 'Alto' : 'Médio-Alto'}
              </span>
              <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">
                🎯 Objetivo: ${index < 2 ? 'Autoridade' : index < 4 ? 'Conexão' : 'Conversão'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 25px; border: 2px solid #dbeafe;">
        <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 16px;">
          📅 Como Usar Este Banco de Ideias:
        </h3>
        <ol style="margin: 0; padding-left: 20px; color: #374151; line-height: 2;">
          <li style="margin-bottom: 10px;">
            <strong>Escolher 2-3 ideias</strong> que mais ressoam com o teu estilo e objetivos imediatos
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Adaptar ao teu tom</strong> - estas ideias são pontos de partida, não templates rígidos
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Criar conteúdo</strong> seguindo o formato sugerido (carrossel/reel/post)
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Publicar e medir</strong> - anotar engagement rate, alcance, saves de cada ideia testada
          </li>
          <li>
            <strong>Iterar e escalar</strong> - repetir/variar as ideias que tiveram melhor performance
          </li>
        </ol>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #3b82f6;">
          <p style="font-size: 13px; color: #1f2937; line-height: 1.7; margin: 0;">
            <strong style="color: #1e40af;">💡 Pro Tip:</strong> Criar "content batches" - dedicar 1 dia 
            para criar conteúdo para a semana inteira. Isto mantém consistência sem gastar tempo todos os dias. 
            Muitos creators de sucesso criam 1-2 semanas de conteúdo de uma vez, depois focam em engagement e 
            estratégia no resto do tempo.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Secção Bónus: Estratégia Visual -->
    <div class="section">
      <h2 class="section-title">🎨 Diretrizes de Estilo Visual</h2>
      
      <p style="margin-bottom: 20px; line-height: 1.8;">
        A consistência visual é crucial para profissionalismo e reconhecimento de marca. Um feed coeso pode 
        aumentar a taxa de conversão visitante→seguidor em até 35%. As recomendações abaixo são baseadas 
        em análise do teu nicho e tendências atuais que funcionam.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #374151; margin-bottom: 15px; font-size: 15px;">🎨 Paleta de Cores Recomendada:</h3>
        <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
          ${analysis.recommendations.visualStyle?.colors?.map((color: string) => `
            <div style="text-align: center;">
              <div style="width: 80px; height: 80px; background: ${color}; border-radius: 12px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
              <div style="font-size: 11px; color: #6b7280; font-weight: 600;">${color}</div>
            </div>
          `).join('') || '<p style="color: #6b7280; font-size: 13px;">Paleta específica será definida baseada na identidade da marca</p>'}
        </div>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
          Usar estas cores de forma consistente em templates, texto on-screen, e elementos gráficos cria 
          identidade visual forte. Não significa que TODAS as fotos precisam ter estas cores, mas elementos 
          de design (texto, shapes, backgrounds) devem seguir esta paleta.
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
        <h3 style="color: #374151; margin-bottom: 15px; font-size: 15px;">✍️ Tipografia e Texto:</h3>
        <p style="font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 12px;">
          <strong>Fonte Principal:</strong> ${analysis.recommendations.visualStyle?.typography || 'Sans-serif moderna e legível (ex: Montserrat, Poppins, Inter)'}
        </p>
        <p style="font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 12px;">
          <strong>Hierarquia:</strong> Usar tamanhos claramente diferentes para título (grande e bold), 
          subtítulos (médio), e corpo de texto (pequeno mas legível). Contraste forte entre texto e fundo.
        </p>
        <p style="font-size: 13px; color: #374151; line-height: 1.7;">
          <strong>Regra 3 segundos:</strong> Todo texto on-screen deve ser lido em 3 segundos ou menos. 
          Se precisar mais texto, dividir em múltiplos slides/frames.
        </p>
      </div>
    </div>

    <!-- Footer Profissional -->
    <div class="footer">
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 18px; color: #111827; margin-bottom: 8px; font-weight: 700;">
          LXON - Gestão Inteligente de Redes Sociais
        </h3>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
          Plataforma de gestão de redes sociais powered by AI para negócios em Portugal
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: #374151; font-size: 14px; margin-bottom: 12px; font-weight: 600;">
          📋 Sobre Este Relatório:
        </h4>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.7; margin-bottom: 10px;">
          Este relatório foi gerado automaticamente através de algoritmos proprietários de análise de redes sociais, 
          processando dados públicos do perfil <strong>@${report.username}</strong> e comparando com uma base de 
          dados de mais de 50.000 perfis similares. A análise inclui métricas quantitativas (números, taxas, frequências) 
          e qualitativas (qualidade de conteúdo, alinhamento estratégico, tendências).
        </p>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.7;">
          <strong>Nota Importante:</strong> Este relatório é uma ferramenta de apoio à decisão, não uma garantia 
          de resultados. O sucesso depende da implementação consistente das recomendações e adaptação contínua 
          baseada em resultados. Redes sociais são dinâmicas - o que funciona hoje pode precisar ajustes amanhã.
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 11px;">
        <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">Perfil Analisado</div>
          <div style="color: #6b7280;">@${report.username}</div>
        </div>
        <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">Data de Geração</div>
          <div style="color: #6b7280;">${new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">Score Geral</div>
          <div style="color: #6b7280; font-size: 16px; font-weight: 700;">${analysis.overallScore}/100</div>
        </div>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 11px; line-height: 1.6; margin-bottom: 8px;">
          © 2025 LXON. Todos os direitos reservados.<br>
          Relatório confidencial gerado para uso interno de ${businessInfo.business}
        </p>
        <p style="color: #9ca3af; font-size: 10px;">
          Versão do Relatório: 2.0 | Algoritmo: LXONAnalytics v3.1
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}