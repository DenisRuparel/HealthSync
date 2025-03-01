import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors when building
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during the build
  },
  env: {
    DATABASE_ID: process.env.NEXT_PUBLIC_DATABASE_ID,
    APPWRITE_PROJECT_ID: process.env.PROJECT_ID,
    APPWRITE_API_KEY: process.env.API_KEY,
  },
  experimental: {
  },
};

export default nextConfig;
