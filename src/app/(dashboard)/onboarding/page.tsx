"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Sparkles,
  Target,
  Users,
  Instagram,
  Settings,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
  X,
} from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    title: "O que fazes ou vendes?",
    subtitle: "Vamos personalizar a estratégia para o teu negócio específico",
    icon: Sparkles,
    hasCustomInput: true,
    customInputLabel: "Descreve em 2-3 palavras o que fazes:",
    customInputPlaceholder: "Ex: Treino online para mulheres",
    options: [
      { value: "ecommerce", label: "🛍️ Produtos físicos", description: "E-commerce, loja online/física" },
      { value: "b2b_services", label: "💼 Serviços B2B", description: "Consultoria, agência, corporate", popular: true },
      { value: "courses", label: "🎓 Cursos/Formação", description: "Educação online, mentorias" },
      { value: "digital_product", label: "📱 Produto digital", description: "App, software, SaaS" },
      { value: "local_services", label: "🏋️ Serviços locais", description: "Ginásio, clínica, salão, restaurante" },
      { value: "content_creator", label: "✍️ Criador de conteúdo", description: "Influencer, blogger, YouTuber" },
      { value: "artist", label: "📚 Artista/Autor", description: "Livro, música, arte" },
      { value: "freelancer", label: "💡 Freelancer/Consultor", description: "Independente, trabalho por projeto" },
      { value: "personal_brand", label: "🎯 Marca pessoal", description: "Ainda sem monetização definida" },
    ],
  },
  {
    id: 2,
    title: "Quem é o teu cliente ideal?",
    subtitle: "Quanto mais específico, melhor será a estratégia",
    icon: Users,
    hasSubQuestions: true,
    options: [
      { value: "business_owners", label: "👔 Empresários e decisores", description: "CEOs, diretores, donos de negócio" },
      { value: "professionals", label: "💼 Profissionais especializados", description: "Advogados, médicos, arquitetos", popular: true },
      { value: "entrepreneurs", label: "👨‍💻 Freelancers e empreendedores", description: "Trabalham por conta própria" },
      { value: "consumers", label: "🛍️ Consumidor final", description: "Público geral B2C" },
      { value: "students", label: "🎓 Estudantes e jovens", description: "18-30 anos a iniciar carreira" },
      { value: "parents", label: "👥 Pais e famílias", description: "Foco em família e crianças" },
      { value: "improvement", label: "💪 Pessoas que querem melhorar", description: "Fitness, finanças, desenvolvimento pessoal" },
    ],
    subQuestions: [
      {
        key: "age",
        label: "Idade média do teu público:",
        type: "select",
        options: ["18-24", "25-34", "35-44", "45-54", "55+"],
      },
      {
        key: "gender",
        label: "Género:",
        type: "select",
        options: ["Maioritariamente mulheres", "Maioritariamente homens", "Ambos"],
      },
      {
        key: "location",
        label: "Localização:",
        type: "select",
        options: ["Portugal", "Brasil", "Europa", "Global"],
      },
    ],
  },
  {
    id: 3,
    title: "Qual é o teu objetivo principal?",
    subtitle: "Vamos focar 100% nisto nos próximos 90 dias",
    icon: Target,
    options: [
      {
        value: "sales",
        label: "💰 Gerar vendas/leads",
        description: "Conversão direta, clientes pagantes",
        popular: true,
      },
      {
        value: "launch",
        label: "📚 Promover lançamento",
        description: "Produto, livro, curso novo",
      },
      {
        value: "authority",
        label: "🔥 Construir autoridade",
        description: "Ser reconhecido como expert",
      },
      {
        value: "audience",
        label: "📈 Crescer audiência",
        description: "Aumentar seguidores para monetizar depois",
      },
      {
        value: "community",
        label: "📧 Construir comunidade",
        description: "Email list, grupo engajado",
      },
      {
        value: "partnerships",
        label: "🤝 Atrair parcerias",
        description: "Investidores, colaborações, B2B",
      },
    ],
  },
  {
    id: 4,
    title: "Conecta o teu Instagram para análise profissional",
    subtitle: "Vamos analisar o teu perfil e criar um relatório detalhado (opcional)",
    icon: Instagram,
    type: "instagram",
    allowSkip: true,
    benefits: [
      "✅ Análise profunda do teu perfil",
      "✅ Score de 0-100 com diagnóstico",
      "✅ Identificação de problemas",
      "✅ Plano de ação personalizado",
      "✅ Relatório em PDF para download",
    ],
  },
  {
    id: 5,
    title: "Como queres trabalhar connosco?",
    subtitle: "Escolhe o nível de automação ideal para ti",
    icon: Settings,
    options: [
      {
        value: "full_auto",
        label: "🤖 Piloto Automático Total",
        description: "A IA cria e publica automaticamente",
        badge: "Mais popular",
        popular: true,
      },
      {
        value: "semi_auto",
        label: "✋ Co-Piloto Inteligente",
        description: "A IA cria, tu aprovas antes de publicar",
        badge: "Recomendado",
      },
      {
        value: "creative_assist",
        label: "🎯 Assistente Criativo",
        description: "Dá-me ideias, eu crio o conteúdo",
      },
      {
        value: "strategy_only",
        label: "📊 Estrategista Pure",
        description: "Só estratégia e análise, sem criação",
      },
    ],
  },
];

// Componente de Search com Dropdown
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Escreve para procurar..." 
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt: any) => opt.value === value);

  // Filtrar opções baseado na pesquisa
  const filteredOptions = options.filter((opt: any) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input de pesquisa */}
      <div className="relative">
        <div
          className="flex items-center gap-3 w-full p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          
          {selectedOption ? (
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{selectedOption.label}</div>
              {selectedOption.description && (
                <div className="text-sm text-gray-500 truncate">{selectedOption.description}</div>
              )}
            </div>
          ) : (
            <span className="flex-1 text-gray-400">{placeholder}</span>
          )}

          {selectedOption && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdown de opções */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden"
            >
              {/* Barra de pesquisa dentro do dropdown */}
              <div className="p-3 border-b sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Procurar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista de opções */}
              <div className="max-h-80 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma opção encontrada
                  </div>
                ) : (
                  filteredOptions.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full p-4 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0 ${
                        value === option.value ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{option.label}</span>
                            {(option.popular || option.badge) && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                {option.badge || "Popular"}
                              </Badge>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-sm text-gray-600">{option.description}</p>
                          )}
                        </div>
                        {value === option.value && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [subAnswers, setSubAnswers] = useState<any>({});
  const [customDescription, setCustomDescription] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: any) => {
    const questionKey = ["business", "audience", "objective", "instagram", "workMode"][
      currentStep
    ];
    setAnswers({ ...answers, [questionKey]: value });
  };

  const handleSubAnswer = (key: string, value: string) => {
    setSubAnswers({ ...subAnswers, [key]: value });
  };

  const canProceed = () => {
    const questionKey = ["business", "audience", "objective", "instagram", "workMode"][
      currentStep
    ];

    if (currentStep === 0) {
      return answers[questionKey] && customDescription.trim().length > 0;
    }

    if (currentStep === 1) {
      const hasMainAnswer = !!answers[questionKey];
      const hasSubAnswers =
        subAnswers.age && subAnswers.gender && subAnswers.location;
      return hasMainAnswer && hasSubAnswers;
    }

    if (currentStep === 3) {
      return true;
    }

    return !!answers[questionKey];
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const finalAnswers = {
        business: answers.business,
        businessDescription: customDescription,
        audience: answers.audience,
        audienceDetails: subAnswers,
        objective: answers.objective,
        instagram: instagramHandle || null,
        workMode: answers.workMode,
        platforms: ["instagram"],
        tone: "professional",
      };

      const response = await axios.post("/api/onboarding/process", finalAnswers);
      router.push("/dashboard?onboarding=completed");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao processar. Tenta novamente.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">A criar a tua estratégia...</h2>
            <div className="space-y-2 text-sm text-gray-600 mt-6">
              <p className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> A analisar o teu negócio...
              </p>
              <p className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> A estudar o teu público-alvo...
              </p>
              {instagramHandle && (
                <p className="flex items-center justify-center gap-2">
                  <Instagram className="w-4 h-4" /> A analisar o teu Instagram...
                </p>
              )}
              <p className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4" /> A criar estratégia completa...
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Isto demora 60-90 segundos... Vale muito a pena! 🚀
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Pergunta {currentStep + 1} de {QUESTIONS.length}
          </span>
          <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <currentQuestion.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
                    <p className="text-gray-600">{currentQuestion.subtitle}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {currentQuestion.type === "instagram" ? (
                  <div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Instagram className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            Análise Profissional do Instagram
                          </h3>
                          <p className="text-sm text-gray-600">
                            Conecta o teu Instagram e recebe um relatório completo em PDF
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {currentQuestion.benefits?.map((benefit, i) => (
                          <p key={i} className="text-sm text-gray-700">
                            {benefit}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Username do Instagram
                        </label>
                        <Input
                          placeholder="@teuinstagram ou URL completo"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          className="text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Ex: @nike ou https://instagram.com/nike
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="w-full"
                      >
                        Não tenho Instagram / Skip este passo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <SearchableSelect
                      options={currentQuestion.options}
                      value={answers[["business", "audience", "objective", "instagram", "workMode"][currentStep]]}
                      onChange={handleAnswer}
                      placeholder="Clica aqui ou começa a escrever para procurar..."
                    />
                  </div>
                )}

                {currentQuestion.hasCustomInput && answers.business && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-medium mb-2">
                      {currentQuestion.customInputLabel}
                    </label>
                    <Input
                      placeholder={currentQuestion.customInputPlaceholder}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="text-lg"
                    />
                  </motion.div>
                )}

                {currentQuestion.hasSubQuestions && answers.audience && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="font-medium text-sm text-gray-700">
                      Detalhes do público-alvo:
                    </p>
                    {currentQuestion.subQuestions?.map((subQ: any) => (
                      <div key={subQ.key}>
                        <label className="block text-sm font-medium mb-2">
                          {subQ.label}
                        </label>
                        <select
                          value={subAnswers[subQ.key] || ""}
                          onChange={(e) => handleSubAnswer(subQ.key, e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="">Seleciona...</option>
                          {subQ.options.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === QUESTIONS.length - 1
                      ? "🚀 Criar Estratégia"
                      : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}