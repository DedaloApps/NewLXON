// src/app/(dashboard)/checkout/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeaderPremium } from "@/components/layout/Header";
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  Shield,
  Loader2,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");

  const plans = {
    pro: {
      name: "Pro",
      price: "9.99",
      icon: Crown,
      color: "from-blue-600 to-purple-600",
      features: [
        "Posts ilimitados",
        "Todas as redes sociais",
        "Analytics avançados",
        "IA para geração de conteúdo",
        "Agendamento automático",
        "Suporte prioritário",
        "Acesso a novos recursos",
        "Sem anúncios",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: "29.99",
      icon: Zap,
      color: "from-purple-600 to-pink-600",
      features: [
        "Tudo do Pro",
        "Múltiplas marcas (até 10)",
        "API personalizada",
        "Gestor de conta dedicado",
        "SLA garantido 99.9%",
        "Formação personalizada",
        "Relatórios customizados",
        "Integração White Label",
      ],
    },
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Aqui integrarias com o Stripe
      // const response = await axios.post("/api/checkout/create-session", {
      //   plan: selectedPlan
      // });
      // window.location.href = response.data.url;

      // Por agora, simular sucesso
      toast.success("A redirecionar para o pagamento...");

      setTimeout(() => {
        // Redirecionar para Stripe Checkout (mock)
        toast.info("Pagamento processado com sucesso!");
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const PlanIcon = plans[selectedPlan].icon;

  return (
    <>
      <HeaderPremium />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <h1 className="text-4xl font-bold mb-4">Escolha o seu plano</h1>
            <p className="text-gray-600 text-lg">
              Faça upgrade e desbloqueie todo o potencial da LXon
            </p>

            <Badge className="mt-4 bg-green-100 text-green-700 border-0 px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              14 dias de teste grátis
            </Badge>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pro Plan */}
            <Card
              onClick={() => setSelectedPlan("pro")}
              className={`cursor-pointer transition-all ${
                selectedPlan === "pro"
                  ? "ring-2 ring-blue-600 shadow-xl scale-105"
                  : "hover:shadow-lg"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${plans.pro.color}`}
                  >
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  {selectedPlan === "pro" && (
                    <Badge className="bg-blue-600">Selecionado</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">Plano Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€{plans.pro.price}</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription className="mt-2">
                  Perfeito para criadores de conteúdo e pequenas empresas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plans.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card
              onClick={() => setSelectedPlan("enterprise")}
              className={`cursor-pointer transition-all relative ${
                selectedPlan === "enterprise"
                  ? "ring-2 ring-purple-600 shadow-xl scale-105"
                  : "hover:shadow-lg"
              }`}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${plans.enterprise.color}`}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  {selectedPlan === "enterprise" && (
                    <Badge className="bg-purple-600">Selecionado</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    €{plans.enterprise.price}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription className="mt-2">
                  Para agências e empresas que precisam de mais poder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plans.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Summary */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-4 rounded-full bg-gradient-to-br ${plans[selectedPlan].color}`}
                  >
                    <PlanIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Plano {plans[selectedPlan].name}
                    </h3>
                    <p className="text-gray-600">
                      €{plans[selectedPlan].price}/mês • Faturado mensalmente
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total hoje</p>
                    <p className="text-3xl font-bold">€0.00</p>
                    <p className="text-xs text-gray-500">
                      14 dias grátis, depois €{plans[selectedPlan].price}/mês
                    </p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    size="lg"
                    className={`bg-gradient-to-r ${plans[selectedPlan].color} hover:opacity-90 shadow-lg min-w-[200px]`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />A
                        processar...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Continuar para Pagamento
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Cancele quando quiser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Garantia 30 dias</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Tem dúvidas?{" "}
              <a
                href="/faqs"
                className="text-blue-600 hover:underline font-semibold"
              >
                Consulte as FAQs
              </a>{" "}
              ou{" "}
              <a
                href="mailto:support@lxon.pt"
                className="text-blue-600 hover:underline font-semibold"
              >
                contacte o suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
