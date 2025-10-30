import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Ignora erros de TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Ignora erros de ESLint
  },
};

export default nextConfig;