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
} from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    title: "Qual é a área de atuação?",
    subtitle: "Personalização da estratégia de acordo com o sector específico",
    icon: Sparkles,
    hasCustomInput: true,
    customInputLabel: "Descrição em 2-3 palavras:",
    customInputPlaceholder: "Ex: Consultoria empresarial",
    options: [
      {
        value: "ecommerce",
        label: "🛍️ Produtos físicos",
        description: "E-commerce, loja online/física",
      },
      {
        value: "b2b_services",
        label: "💼 Serviços B2B",
        description: "Consultoria, agência, corporate",
        popular: true,
      },
      {
        value: "courses",
        label: "🎓 Cursos/Formação",
        description: "Educação online, mentorias",
      },
      {
        value: "digital_product",
        label: "📱 Produto digital",
        description: "App, software, SaaS",
      },
      {
        value: "local_services",
        label: "🏋️ Serviços locais",
        description: "Ginásio, clínica, salão, restaurante",
      },
      {
        value: "content_creator",
        label: "✍️ Criador de conteúdo",
        description: "Influencer, blogger, YouTuber",
      },
      {
        value: "artist",
        label: "📚 Artista/Autor",
        description: "Livro, música, arte",
      },
      {
        value: "freelancer",
        label: "💡 Freelancer/Consultor",
        description: "Independente, trabalho por projeto",
      },
      {
        value: "personal_brand",
        label: "🎯 Marca pessoal",
        description: "Ainda sem monetização definida",
      },
    ],
  },
  {
    id: 2,
    title: "Qual é o público-alvo?",
    subtitle: "Especificidade permite estratégia mais eficaz",
    icon: Users,
    hasSubQuestions: true,
    options: [
      {
        value: "business_owners",
        label: "👔 Empresários e decisores",
        description: "CEOs, diretores, donos de negócio",
      },
      {
        value: "professionals",
        label: "💼 Profissionais especializados",
        description: "Advogados, médicos, arquitetos",
        popular: true,
      },
      {
        value: "entrepreneurs",
        label: "👨‍💻 Freelancers e empreendedores",
        description: "Trabalham por conta própria",
      },
      {
        value: "consumers",
        label: "🛍️ Consumidor final",
        description: "Público geral B2C",
      },
      {
        value: "students",
        label: "🎓 Estudantes e jovens",
        description: "18-30 anos a iniciar carreira",
      },
      {
        value: "parents",
        label: "👥 Pais e famílias",
        description: "Foco em família e crianças",
      },
      {
        value: "improvement",
        label: "💪 Pessoas que querem melhorar",
        description: "Fitness, finanças, desenvolvimento pessoal",
      },
    ],
    subQuestions: [
      {
        key: "age",
        label: "Idade média do público:",
        type: "select",
        options: ["18-24", "25-34", "35-44", "45-54", "55+"],
      },
      {
        key: "gender",
        label: "Género:",
        type: "select",
        options: [
          "Maioritariamente mulheres",
          "Maioritariamente homens",
          "Ambos",
        ],
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
    title: "Qual é o objetivo principal?",
    subtitle: "Foco estratégico para os próximos 90 dias",
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
    title: "Conectar Instagram para análise profissional",
    subtitle:
      "Análise detalhada do perfil e relatório completo (opcional)",
    icon: Instagram,
    type: "instagram",
    allowSkip: true,
    benefits: [
      "✅ Análise profunda do perfil",
      "✅ Score de 0-100 com diagnóstico",
      "✅ Identificação de oportunidades",
      "✅ Plano de ação personalizado",
      "✅ Relatório em PDF para download",
    ],
  },
];

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Procurar ou selecionar...",
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt: any) => opt.value === value);

  const filteredOptions = options.filter(
    (opt: any) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
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

  const handleInputClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      {selectedOption ? (
        <div
          className="w-full p-4 border rounded-xl cursor-pointer transition-all bg-white border-indigo-200 hover:border-indigo-300"
          onClick={() => {
            onChange(null);
            setSearchTerm("");
            setIsOpen(true);
          }}
        >
          <div className="font-medium text-gray-900">
            {selectedOption.label}
          </div>
          {selectedOption.description && (
            <div className="text-sm text-gray-600 mt-0.5">
              {selectedOption.description}
            </div>
          )}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={handleInputClick}
          className={`w-full p-4 border rounded-xl transition-all bg-white ${
            isOpen
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-indigo-200 hover:border-indigo-300"
          } focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
        />
      )}

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-indigo-200 rounded-xl shadow-2xl shadow-indigo-500/10 overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {filteredOptions.map((option: any) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full p-4 text-left transition-colors ${
                    value === option.value
                      ? "bg-indigo-50 border-l-4 border-indigo-600"
                      : "hover:bg-indigo-50/50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                        {(option.popular || option.badge) && (
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs border-0">
                            {option.badge || "Popular"}
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {value === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 bg-white border border-indigo-200 rounded-xl shadow-2xl shadow-indigo-500/10 p-6"
        >
          <div className="text-center text-gray-500 text-sm">
            Nenhuma opção encontrada
          </div>
        </motion.div>
      )}
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
  const [loadingStage, setLoadingStage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  const currentQuestion = QUESTIONS[currentStep] || QUESTIONS[0];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const QuestionIcon = currentQuestion?.icon || Sparkles;

  const handleAnswer = (value: any) => {
    const questionKey = [
      "business",
      "audience",
      "objective",
      "instagram",
      "workMode",
    ][currentStep];
    setAnswers({ ...answers, [questionKey]: value });
  };

  const handleSubAnswer = (key: string, value: string) => {
    setSubAnswers({ ...subAnswers, [key]: value });
  };

  const canProceed = () => {
    const questionKey = [
      "business",
      "audience",
      "objective",
      "instagram",
      "workMode",
    ][currentStep];

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
    setLoadingStage(0);
    setCompletedTasks([]);
    setCurrentProgress(0);

    try {
      const finalAnswers = {
        business: answers.business,
        businessDescription: customDescription,
        audience: answers.audience,
        audienceDetails: subAnswers,
        objective: answers.objective,
        instagram: instagramHandle || null,
        platforms: ["instagram"],
        tone: "professional",
      };

      const answersEncoded = encodeURIComponent(JSON.stringify(finalAnswers));
      const eventSource = new EventSource(
        `/api/onboarding/process?answers=${answersEncoded}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "stage") {
          setCompletedTasks((prev) => [...prev, data.title]);
          setCurrentProgress(data.progress || 0);
        }

        if (data.type === "post") {
          setCompletedTasks((prev) => [...prev, data.title]);
          setCurrentProgress(data.progress || 0);
        }

        if (data.type === "post_complete") {
          setCurrentProgress(data.progress || 0);
        }

        if (data.type === "complete") {
          eventSource.close();
          setCurrentProgress(100);
          setTimeout(() => {
            router.push("/dashboard?onboarding=completed");
          }, 1000);
        }

        if (data.type === "error") {
          eventSource.close();
          setError(data.message);
          setLoading(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setError("Erro de conexão. Tente novamente.");
        setLoading(false);
      };
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Erro ao processar. Tente novamente."
      );
      setLoading(false);
    }
  };

  if (loading) {
    const currentStageTitle =
      completedTasks[completedTasks.length - 1] || "Iniciando...";
    const currentStageSubtitle = "Processamento com IA...";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-indigo-50/30 to-white p-4">
        <Card className="w-full max-w-2xl shadow-2xl shadow-indigo-500/10 border border-indigo-200">
          <CardContent className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-3 tracking-tight">
                Criação em Progresso
              </h2>
              <p className="text-gray-600">
                Agentes de IA a trabalhar em tempo real
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Progresso
                </span>
                <span className="text-sm font-semibold text-indigo-600">
                  {Math.round(currentProgress)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600"
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stage atual */}
            <motion.div
              key={currentStageTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-indigo-600" />
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {currentStageTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentStageSubtitle}
                  </p>
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            </motion.div>

            {/* Tasks completadas */}
            <div className="space-y-2 max-h-64 overflow-y-auto mb-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Tarefas Concluídas
              </p>
              {completedTasks.slice(0, -1).map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{task}</span>
                </motion.div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="pt-8 border-t border-indigo-100">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-semibold text-indigo-600 mb-1">
                    {Math.min(Math.floor(currentProgress / 30), 3)}
                  </div>
                  <div className="text-xs text-gray-600">Posts Criados</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-violet-600 mb-1">
                    {Math.min(Math.floor(currentProgress / 10), 10)}
                  </div>
                  <div className="text-xs text-gray-600">Ideias Geradas</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-indigo-600 mb-1">
                    {Math.round(currentProgress)}%
                  </div>
                  <div className="text-xs text-gray-600">Concluído</div>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-xs text-gray-500 mt-8"
            >
              ✨ IA a criar conteúdo de alta qualidade
            </motion.p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white p-4">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            Pergunta {currentStep + 1} de {QUESTIONS.length}
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border border-indigo-200 shadow-xl shadow-indigo-500/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                    <QuestionIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-semibold mb-2 text-gray-900 tracking-tight">
                      {currentQuestion.title}
                    </h2>
                    <p className="text-gray-600">{currentQuestion.subtitle}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {currentQuestion.type === "instagram" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-indigo-100">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Análise Profissional do Instagram
                        </h3>
                        <p className="text-sm text-gray-600">
                          Conexão para análise detalhada e relatório em PDF
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {currentQuestion.benefits?.map(
                        (benefit: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">
                              {benefit.replace("✅ ", "")}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Username do Instagram
                      </label>
                      <Input
                        placeholder="@instagram ou URL completo"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        className="h-12 text-base border-indigo-200 focus:border-indigo-500 rounded-xl"
                      />
                      <p className="text-xs text-gray-500">
                        Ex: @nike ou https://instagram.com/nike
                      </p>
                    </div>

                    <div className="pt-1">
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="w-full text-gray-600 hover:text-gray-900 hover:bg-indigo-50 border-indigo-200 rounded-full"
                      >
                        Saltar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <SearchableSelect
                      options={currentQuestion.options}
                      value={
                        answers[
                          [
                            "business",
                            "audience",
                            "objective",
                            "instagram",
                            "workMode",
                          ][currentStep]
                        ]
                      }
                      onChange={handleAnswer}
                      placeholder="Clique ou comece a escrever para procurar..."
                    />
                  </div>
                )}

                {currentQuestion.hasCustomInput && answers.business && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      {currentQuestion.customInputLabel}
                    </label>
                    <Input
                      placeholder={currentQuestion.customInputPlaceholder}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="text-lg border-indigo-200 focus:border-indigo-500 rounded-xl"
                    />
                  </motion.div>
                )}

                {currentQuestion.hasSubQuestions && answers.audience && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4 mb-6 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100"
                  >
                    <p className="font-medium text-sm text-gray-700">
                      Detalhes do público-alvo:
                    </p>
                    {currentQuestion.subQuestions?.map((subQ: any) => (
                      <div key={subQ.key}>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          {subQ.label}
                        </label>
                        <select
                          value={subAnswers[subQ.key] || ""}
                          onChange={(e) =>
                            handleSubAnswer(subQ.key, e.target.value)
                          }
                          className="w-full p-3 border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                        >
                          <option value="">Selecionar...</option>
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
                      className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full shadow-lg shadow-indigo-500/30"
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