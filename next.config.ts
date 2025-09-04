import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["arkhamdb.com"],
  },
  eslint: {
    ignoreDuringBuilds: true, // ← disables ESLint during next build (incl. Vercel)
  },
};

export default nextConfig;
