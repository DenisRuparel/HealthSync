import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors when building
  },
};

export default nextConfig;