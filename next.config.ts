import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors when building
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during the build
  },
  env: {
    APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
    APPWRITE_PATIENTS_COLLECTION_ID: process.env.APPWRITE_PATIENTS_COLLECTION_ID,
    APPWRITE_DOCTORS_COLLECTION_ID: process.env.APPWRITE_DOCTORS_COLLECTION_ID,
    APPWRITE_APPOINTMENT_COLLECTION_ID: process.env.APPWRITE_APPOINTMENT_COLLECTION_ID,
    APPWRITE_BUCKET_ID: process.env.APPWRITE_BUCKET_ID,
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
    APPWRITE_ADMIN_PASSKEY: process.env.APPWRITE_ADMIN_PASSKEY,
  },
  experimental: {
  },
};

export default nextConfig;
