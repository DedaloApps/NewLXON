// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-purple-50/30 to-white p-4">
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm font-normal text-gray-600 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-normal tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LXon
          </span>
        </div>

        <Card className="border border-purple-100/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-normal text-gray-900 tracking-tight">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-gray-600 font-normal">
              Comece a criar conteúdo com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-normal border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="O seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 border-purple-100/50 focus:border-purple-300 focus:ring-purple-500/20 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-purple-100/50 focus:border-purple-300 focus:ring-purple-500/20 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 border-purple-100/50 focus:border-purple-300 focus:ring-purple-500/20 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium shadow-lg shadow-purple-500/25 transition-all"
                disabled={loading}
              >
                {loading ? "A criar conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm font-normal">
              <span className="text-gray-600">Já tem conta? </span>
              <Link
                href="/login"
                className="text-purple-600 hover:text-pink-600 font-medium transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500 font-normal">
          Ao criar conta, concorda com os nossos{" "}
          <Link href="#" className="text-purple-600 hover:text-pink-600 transition-colors">
            Termos de Serviço
          </Link>
          {" "}e{" "}
          <Link href="#" className="text-purple-600 hover:text-pink-600 transition-colors">
            Política de Privacidade
          </Link>
        </p>
      </motion.div>
    </div>
  );
}