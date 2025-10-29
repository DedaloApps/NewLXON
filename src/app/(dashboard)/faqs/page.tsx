// src/app/(dashboard)/faqs/page.tsx
"use client";

import { useState } from "react";
import { HeaderPremium } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Calendar,
  BarChart3,
  Instagram,
  Settings,
  CreditCard,
  Shield,
  Zap,
  MessageCircle,
} from "lucide-react";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  popular?: boolean;
}

const FAQ_CATEGORIES = [
  { id: "all", label: "Todas", icon: HelpCircle },
  { id: "getting-started", label: "Primeiros Passos", icon: BookOpen },
  { id: "content", label: "Criação de Conteúdo", icon: Sparkles },
  { id: "scheduling", label: "Agendamento", icon: Calendar },
  { id: "analytics", label: "Análise e Métricas", icon: BarChart3 },
  { id: "integrations", label: "Integrações", icon: Instagram },
  { id: "account", label: "Conta e Definições", icon: Settings },
  { id: "billing", label: "Faturação", icon: CreditCard },
  { id: "security", label: "Segurança", icon: Shield },
];

const FAQS: FAQ[] = [
  // Getting Started
  {
    id: "1",
    category: "getting-started",
    question: "Como iniciar a utilização da plataforma LXon?",
    answer:
      "Para começar, basta criar uma conta e completar o processo de onboarding. Durante este processo, o sistema irá colocar algumas questões sobre o negócio, público-alvo e objetivos. Com base nestas informações, os agentes de IA criarão uma estratégia de conteúdo personalizada. O processo completo demora aproximadamente 5-10 minutos.",
    popular: true,
  },
  {
    id: "2",
    category: "getting-started",
    question: "É necessário conhecimento técnico para utilizar a plataforma?",
    answer:
      "Não. A plataforma LXon foi desenvolvida para ser intuitiva e acessível a utilizadores de todos os níveis de experiência. O interface é totalmente visual e os agentes de IA orientam o processo de criação de conteúdo. Não são necessários conhecimentos de programação ou design.",
    popular: true,
  },
  {
    id: "3",
    category: "getting-started",
    question: "Quais as redes sociais suportadas pela plataforma?",
    answer:
      "Atualmente, a plataforma LXon suporta Instagram, Facebook, LinkedIn e Twitter/X. Estão planeadas integrações com TikTok, Pinterest e YouTube nos próximos meses. Cada plataforma tem funcionalidades específicas otimizadas para os seus formatos.",
  },

  // Content Creation
  {
    id: "4",
    category: "content",
    question: "Como funciona a geração automática de conteúdo?",
    answer:
      "O sistema utiliza múltiplos agentes de IA especializados: o Strategy Agent define a estratégia, o Content Agent cria textos e legendas, o Visual Agent gera imagens realistas, e o Scheduling Agent otimiza os horários de publicação. Todo o conteúdo é gerado com base nas informações fornecidas durante o onboarding e nas melhores práticas de marketing digital.",
    popular: true,
  },
  {
    id: "5",
    category: "content",
    question: "É possível editar o conteúdo gerado pela IA?",
    answer:
      "Sim, absolutamente. Todo o conteúdo gerado pode ser editado no Content Hub. O sistema oferece edição inline para textos, legendas e hashtags. As imagens podem ser regeneradas com diferentes estilos, e os posts podem ser reorganizados no calendário. A plataforma serve como assistente, não como substituto da criatividade humana.",
    popular: true,
  },
  {
    id: "6",
    category: "content",
    question: "Que tipos de conteúdo podem ser criados?",
    answer:
      "A plataforma gera posts únicos, carrosséis, reels, stories, vídeos com voz portuguesa (via HeyGen), e imagens realistas estilo fotografia de smartphone. Cada tipo de conteúdo é otimizado para máximo engagement e adaptado às especificações de cada rede social.",
  },
  {
    id: "7",
    category: "content",
    question: "As imagens geradas parecem artificiais?",
    answer:
      "Não. O sistema utiliza modelos avançados (FLUX Pro, DALL-E 3, Stable Diffusion XL) com prompts otimizados para criar imagens realistas com estética de fotografia profissional. As imagens são armazenadas permanentemente no Supabase e não expiram.",
  },

  // Scheduling
  {
    id: "8",
    category: "scheduling",
    question: "Como funciona o agendamento automático de publicações?",
    answer:
      "O Scheduling Agent analisa os melhores horários para publicação com base no comportamento do público-alvo e nas métricas de engagement. O sistema pode trabalhar em modo totalmente automático (publica nos horários otimizados) ou em modo manual (requer aprovação). O calendário visual permite reorganizar publicações através de drag-and-drop.",
    popular: true,
  },
  {
    id: "9",
    category: "scheduling",
    question: "É possível agendar publicações com antecedência?",
    answer:
      "Sim. O sistema permite agendar conteúdo para dias, semanas ou meses. O Content Hub apresenta um calendário completo onde é possível visualizar e gerir todas as publicações agendadas. O sistema também sugere automaticamente os melhores slots de publicação.",
  },
  {
    id: "10",
    category: "scheduling",
    question: "O que acontece se for necessário cancelar uma publicação agendada?",
    answer:
      "As publicações agendadas podem ser canceladas, editadas ou reagendadas a qualquer momento através do Content Hub. Basta selecionar o post no calendário e escolher a ação desejada. As alterações são aplicadas imediatamente.",
  },

  // Analytics
  {
    id: "11",
    category: "analytics",
    question: "Que métricas e análises estão disponíveis?",
    answer:
      "O dashboard apresenta métricas completas incluindo: engagement rate, alcance, impressões, crescimento de seguidores, melhores horários de publicação, performance por tipo de conteúdo, e análise de hashtags. Todos os dados são apresentados em gráficos visuais e relatórios exportáveis em PDF.",
    popular: true,
  },
  {
    id: "12",
    category: "analytics",
    question: "Com que frequência são atualizadas as métricas?",
    answer:
      "As métricas são sincronizadas automaticamente a cada 6 horas com as APIs das redes sociais. É também possível forçar uma sincronização manual através do dashboard. Os relatórios históricos ficam disponíveis permanentemente.",
  },
  {
    id: "13",
    category: "analytics",
    question: "A plataforma oferece análise de perfil do Instagram?",
    answer:
      "Sim. Durante o onboarding, o sistema utiliza a API Apify para fazer scraping completo do perfil Instagram e gera um relatório detalhado em PDF com pontuação, insights e recomendações estratégicas. Esta análise pode ser repetida a qualquer momento.",
  },

  // Integrations
  {
    id: "14",
    category: "integrations",
    question: "Como conectar as contas das redes sociais?",
    answer:
      "Nas definições da conta, existe uma secção de Integrações onde é possível conectar cada rede social através de OAuth. O processo é seguro e requer apenas autorização das permissões necessárias. As credenciais são encriptadas e nunca partilhadas.",
  },
  {
    id: "15",
    category: "integrations",
    question: "É necessário dar permissão total às contas das redes sociais?",
    answer:
      "Não. A plataforma solicita apenas as permissões mínimas necessárias: ler métricas, publicar conteúdo, e gerir agendamento. Em nenhum momento a plataforma acede a mensagens privadas ou outras informações sensíveis. As permissões podem ser revogadas a qualquer momento.",
  },
  {
    id: "16",
    category: "integrations",
    question: "O que acontece se desconectar uma rede social?",
    answer:
      "Ao desconectar uma rede social, as publicações agendadas para essa plataforma são automaticamente pausadas. O histórico de conteúdo e métricas permanece disponível. É possível reconectar a conta a qualquer momento sem perda de dados.",
  },

  // Account & Settings
  {
    id: "17",
    category: "account",
    question: "Como alterar as informações da conta?",
    answer:
      "As informações da conta podem ser atualizadas na secção Perfil. É possível alterar nome, email, password, fotografia de perfil, e preferências de notificações. Alterações ao email requerem verificação através de um link enviado para o novo endereço.",
  },
  {
    id: "18",
    category: "account",
    question: "É possível ter múltiplos utilizadores na mesma conta?",
    answer:
      "Sim, nos planos Professional e Enterprise. O sistema permite criar equipas com diferentes níveis de permissões (Administrador, Editor, Visualizador). Cada membro tem acesso próprio e as ações ficam registadas no histórico de auditoria.",
  },
  {
    id: "19",
    category: "account",
    question: "Como refazer o processo de onboarding?",
    answer:
      "O onboarding pode ser refeito a qualquer momento através das Definições > Estratégia. Isto irá gerar uma nova análise completa e atualizar a estratégia de conteúdo. O histórico anterior é preservado para referência.",
  },

  // Billing
  {
    id: "20",
    category: "billing",
    question: "Quais os planos de subscrição disponíveis?",
    answer:
      "A LXon oferece três planos: Free (funcionalidades básicas, 10 posts/mês), Professional (€29/mês, posts ilimitados, múltiplas contas), e Enterprise (preço personalizado, equipas, suporte prioritário). Todos os planos incluem os agentes de IA e geração de conteúdo.",
    popular: true,
  },
  {
    id: "21",
    category: "billing",
    question: "É possível alterar ou cancelar a subscrição?",
    answer:
      "Sim. A subscrição pode ser alterada ou cancelada a qualquer momento através de Definições > Faturação. Não existem períodos de fidelização. Em caso de cancelamento, o acesso mantém-se ativo até ao final do período já pago.",
  },
  {
    id: "22",
    category: "billing",
    question: "Que métodos de pagamento são aceites?",
    answer:
      "Aceitamos cartões de crédito/débito (Visa, Mastercard, American Express) e SEPA Direct Debit para clientes na zona Euro. Os pagamentos são processados de forma segura através do Stripe. Não armazenamos dados de cartões nos nossos servidores.",
  },

  // Security
  {
    id: "23",
    category: "security",
    question: "Como é garantida a segurança dos dados?",
    answer:
      "Todos os dados são encriptados em trânsito (TLS 1.3) e em repouso (AES-256). As passwords são hash com bcrypt. Realizamos backups diários automáticos. A infraestrutura cumpre com GDPR e as melhores práticas de segurança da indústria.",
    popular: true,
  },
  {
    id: "24",
    category: "security",
    question: "Onde são armazenados os dados?",
    answer:
      "Os dados são armazenados em servidores na União Europeia (AWS Frankfurt e Supabase EU). Garantimos conformidade total com as regulamentações europeias de proteção de dados (GDPR). Nunca transferimos dados para fora da UE sem consentimento explícito.",
  },
  {
    id: "25",
    category: "security",
    question: "É possível exportar ou eliminar os dados?",
    answer:
      "Sim. Em conformidade com o GDPR, os utilizadores podem solicitar exportação completa dos seus dados em formato JSON/CSV a qualquer momento. A eliminação permanente da conta e todos os dados associados pode ser solicitada através de Definições > Conta > Eliminar Conta.",
  },
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFAQs = FAQS.filter((faq) => faq.popular);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <>
      <HeaderPremium pageTitle="Perguntas Frequentes" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Como podemos ajudar?
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Encontre respostas para as questões mais frequentes sobre a
                plataforma LXon
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Procurar questões..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white dark:bg-gray-800 border-0 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {FAQS.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Artigos de ajuda disponíveis
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {FAQ_CATEGORIES.length - 1}
                </div>
                <p className="text-sm text-muted-foreground">
                  Categorias organizadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  24/7
                </div>
                <p className="text-sm text-muted-foreground">
                  Suporte disponível
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Questions */}
          {searchQuery === "" && selectedCategory === "all" && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Questões Mais Populares
              </h2>
              <div className="grid gap-4">
                {popularFAQs.map((faq) => (
                  <Card
                    key={faq.id}
                    className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {faq.question}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            >
                              Popular
                            </Badge>
                          </div>
                          {expandedFAQ === faq.id && (
                            <p className="text-muted-foreground mt-3 leading-relaxed">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Explorar por Categoria</h2>
            <div className="flex flex-wrap gap-3">
              {FAQ_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* FAQ List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory === "all"
                  ? "Todas as Questões"
                  : FAQ_CATEGORIES.find((cat) => cat.id === selectedCategory)
                      ?.label}
              </h2>
              <Badge variant="secondary" className="text-sm">
                {filteredFAQs.length}{" "}
                {filteredFAQs.length === 1 ? "questão" : "questões"}
              </Badge>
            </div>

            {filteredFAQs.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Não foram encontradas questões correspondentes à pesquisa.
                    <br />
                    Tente utilizar palavras-chave diferentes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFAQs.map((faq) => (
                  <Card
                    key={faq.id}
                    className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {faq.question}
                          </h3>
                          {expandedFAQ === faq.id && (
                            <p className="text-muted-foreground mt-3 leading-relaxed">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">
                Não encontrou a resposta?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                A nossa equipa de suporte está disponível para ajudar. Entre em
                contacto connosco através do email ou chat ao vivo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Iniciar Chat
                </Button>
                <Button size="lg" variant="outline">
                  support@lxon.pt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}