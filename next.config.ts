import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors when building
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during the build
  },
  env: {
    NEXT_PUBLIC_DATABASE_ID: process.env.NEXT_PUBLIC_DATABASE_ID,
    NEXT_PUBLIC_PATIENTS_COLLECTION_ID: process.env.NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
    NEXT_PUBLIC_DOCTORS_COLLECTION_ID: process.env.NEXT_PUBLIC_DOCTORS_COLLECTION_ID,
    NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID: process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
    NEXT_PUBLIC_BUCKET_ID: process.env.NEXT_PUBLIC_BUCKET_ID,
    NEXT_PUBLIC_ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
    NEXT_PUBLIC_ADMIN_PASSKEY: process.env.NEXT_PUBLIC_ADMIN_PASSKEY,
  },
  experimental: {
  },
};

export default nextConfig;
