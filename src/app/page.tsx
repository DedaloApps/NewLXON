// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Calendar,
  BarChart3,
  Target,
  Brain,
  Rocket,
  Clock,
  Star,
  MessageSquare,
  Play,
  Lightbulb,
  Image as ImageIcon,
  Video,
  Users,
  LineChart,
  Palette,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-purple-100/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-light tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  LXon
                </span>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#services"
                  className="text-sm font-light text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Serviços
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-light text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Processo
                </a>
                <a
                  href="#cases"
                  className="text-sm font-light text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Casos
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-light"
                >
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-light shadow-lg shadow-purple-500/25"
                >
                  <Link href="/register">
                    Começar
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 lg:px-8">
          <motion.div
            style={{ opacity, scale }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex mb-6"
            >
              <Badge className="px-3 py-1 text-xs font-light bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-0 rounded-full">
                Marketing Digital Reimaginado
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl lg:text-8xl font-extralight mb-6 leading-[1.1] tracking-tight text-gray-900"
            >
              Crie a sua
              <br />
              <span className="font-light bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Campanha de Comunicação 360º
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl md:text-2xl font-light text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Estratégia, criação e análise alimentadas por IA.
              <br className="hidden md:block" />
              Simplicidade encontra inovação.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 h-12 rounded-full font-light text-base shadow-lg shadow-purple-500/25"
              >
                <Link href="/register">
                  Começar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="px-8 h-12 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full font-light text-base"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Vídeo
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Demo Preview */}
        <section className="pb-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-purple-100/50">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 flex items-center gap-2 border-b border-purple-100/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400/50" />
                  </div>
                </div>
                <div className="p-12 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                  <div className="w-full h-[500px] rounded-2xl bg-gradient-to-br from-white to-purple-50/50 flex items-center justify-center border border-purple-100/50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-700 font-light text-lg">Plataforma Unificada</p>
                      <p className="text-sm text-gray-500 mt-2 font-light">Gestão inteligente de todas as operações</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { value: "15×", label: "Mais Eficiente" },
                { value: "98%", label: "Satisfação" },
                { value: "24/7", label: "Disponível" },
                { value: "∞", label: "Criatividade" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <div className="text-5xl md:text-6xl font-extralight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm font-light">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 px-6 lg:px-8 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-5xl md:text-6xl font-extralight mb-6 text-gray-900 tracking-tight">
                  Capacidades
                </h2>
                <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto">
                  Tecnologia de ponta ao serviço do seu objetivo
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl overflow-hidden">
              {[
                {
                  icon: Brain,
                  title: "Estratégia",
                  description:
                    "Planeamento estratégico baseado em dados e análise preditiva de tendências de mercado.",
                  gradient: "from-purple-600 to-purple-700",
                },
                {
                  icon: ImageIcon,
                  title: "Design Visual",
                  description:
                    "Criação automatizada de identidade visual consistente através de IA generativa.",
                  gradient: "from-pink-600 to-pink-700",
                },
                {
                  icon: Video,
                  title: "Conteúdo Vídeo",
                  description:
                    "Produção audiovisual otimizada para engagement em múltiplas plataformas digitais.",
                  gradient: "from-purple-600 to-pink-600",
                },
                {
                  icon: MessageSquare,
                  title: "Multi-Plataforma",
                  description:
                    "Gestão coordenada de Instagram, LinkedIn, Facebook e TikTok numa interface única.",
                  gradient: "from-indigo-600 to-purple-600",
                },
                {
                  icon: LineChart,
                  title: "Análise",
                  description:
                    "Dashboards executivos com métricas em tempo real e insights acionáveis.",
                  gradient: "from-pink-600 to-rose-600",
                },
                {
                  icon: Target,
                  title: "Campanhas",
                  description:
                    "Otimização contínua de investimento publicitário através de machine learning.",
                  gradient: "from-purple-600 to-indigo-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white p-8 hover:bg-purple-50/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-light mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-32 px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-5xl md:text-6xl font-extralight mb-6 text-gray-900 tracking-tight">
                  Como Funciona
                </h2>
                <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto">
                  Três passos para transformação digital completa
                </p>
              </motion.div>
            </div>

            <div className="space-y-24">
              {[
                {
                  step: "01",
                  title: "Análise",
                  description:
                    "Integração das plataformas existentes e análise profunda de dados históricos. Identificação automática de padrões e oportunidades através de algoritmos avançados.",
                  icon: Users,
                  gradient: "from-purple-600 to-pink-600",
                },
                {
                  step: "02",
                  title: "Planeamento",
                  description:
                    "Desenvolvimento de estratégia personalizada alinhada com objetivos de negócio. Calendário editorial automatizado e guidelines de comunicação.",
                  icon: Brain,
                  gradient: "from-pink-600 to-purple-600",
                },
                {
                  step: "03",
                  title: "Execução",
                  description:
                    "Criação e distribuição automática de conteúdo otimizado. Monitorização contínua com ajustes em tempo real baseados em performance.",
                  icon: Rocket,
                  gradient: "from-purple-600 to-indigo-600",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="grid md:grid-cols-2 gap-12 items-center"
                >
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <div className="text-8xl font-extralight bg-gradient-to-r from-purple-100 to-pink-100 bg-clip-text text-transparent mb-4">{step.step}</div>
                    <h3 className="text-3xl font-light mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 font-light leading-relaxed text-lg">{step.description}</p>
                  </div>
                  <div className={index % 2 === 1 ? "md:order-1" : ""}>
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center border border-purple-100/50">
                      <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl shadow-purple-500/25`}>
                        <step.icon className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="cases" className="py-32 px-6 lg:px-8 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-5xl md:text-6xl font-extralight mb-6 text-gray-900 tracking-tight">
                  Casos de Sucesso
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Maria Silva",
                  role: "CEO · Tech Solutions",
                  content:
                    "Aumento de 340% no engagement. A qualidade do conteúdo gerado supera equipas tradicionais.",
                  avatar: "MS",
                  gradient: "from-purple-600 to-pink-600",
                },
                {
                  name: "João Costa",
                  role: "CMO · Innovation Labs",
                  content:
                    "Redução significativa no tempo de produção. O ROI melhorou drasticamente com otimização por IA.",
                  avatar: "JC",
                  gradient: "from-pink-600 to-purple-600",
                },
                {
                  name: "Ana Ferreira",
                  role: "Founder · Digital Ventures",
                  content:
                    "Insights estratégicos cruciais. Triplicação de resultados em três meses.",
                  avatar: "AF",
                  gradient: "from-indigo-600 to-purple-600",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="h-full border border-purple-100/50 bg-white hover:shadow-xl hover:shadow-purple-500/10 transition-all">
                    <CardContent className="p-8">
                      <p className="text-gray-600 mb-8 font-light leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-light shadow-lg shadow-purple-500/25`}>
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-light text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-500 font-light">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-5xl md:text-6xl font-extralight mb-6 text-gray-900 tracking-tight">
                Começar Hoje
              </h2>
              <p className="text-xl font-light text-gray-600 mb-12 max-w-2xl mx-auto">
                Transforme a estratégia digital com tecnologia de próxima geração
              </p>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 h-14 rounded-full font-light text-base shadow-lg shadow-purple-500/25"
              >
                <Link href="/register">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="mt-8 text-sm text-gray-500 font-light">
                Implementação imediata · Suporte dedicado · Flexibilidade total
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 lg:px-8 border-t border-purple-100/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-base font-light bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">LXon</span>
                </div>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  Inteligência artificial aplicada ao marketing digital. Inovação, simplicidade, resultados.
                </p>
              </div>

              <div>
                <h3 className="font-light mb-4 text-gray-900 text-sm">Produto</h3>
                <ul className="space-y-3 text-sm font-light text-gray-500">
                  <li>
                    <a href="#services" className="hover:text-purple-600 transition-colors">
                      Capacidades
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="hover:text-purple-600 transition-colors">
                      Integrações
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="hover:text-purple-600 transition-colors">
                      Segurança
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-light mb-4 text-gray-900 text-sm">Empresa</h3>
                <ul className="space-y-3 text-sm font-light text-gray-500">
                  <li>
                    <a href="#" className="hover:text-purple-600 transition-colors">
                      Sobre
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-600 transition-colors">
                      Carreiras
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-600 transition-colors">
                      Contacto
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-light mb-4 text-gray-900 text-sm">Legal</h3>
                <ul className="space-y-3 text-sm font-light text-gray-500">
                  <li>
                    <a href="#" className="hover:text-purple-600 transition-colors">
                      Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-600 transition-colors">
                      Termos
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-purple-100/50 text-center text-sm text-gray-500 font-light">
              <p>© 2025 LXon</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}