import * as sdk from "node-appwrite";

// Validate environment variables
function checkEnvVar(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`🚨 Missing required environment variable: ${name}`);
  }
  return value;
}

export const ENDPOINT = checkEnvVar("NEXT_PUBLIC_ENDPOINT", process.env.NEXT_PUBLIC_ENDPOINT);
export const PROJECT_ID = checkEnvVar("PROJECT_ID", process.env.PROJECT_ID);
export const API_KEY = checkEnvVar("API_KEY", process.env.API_KEY);
export const NEXT_PUBLIC_DATABASE_ID = checkEnvVar("NEXT_PUBLIC_DATABASE_ID", process.env.NEXT_PUBLIC_DATABASE_ID);
export const NEXT_PUBLIC_PATIENTS_COLLECTION_ID = checkEnvVar("NEXT_PUBLIC_PATIENTS_COLLECTION_ID", process.env.NEXT_PUBLIC_PATIENTS_COLLECTION_ID);
export const NEXT_PUBLIC_DOCTOR_COLLECTION_ID = checkEnvVar("NEXT_PUBLIC_DOCTOR_COLLECTION_ID", process.env.NEXT_PUBLIC_DOCTOR_COLLECTION_ID);
export const NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID = checkEnvVar("NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID", process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID);
export const BUCKET_ID = checkEnvVar("NEXT_PUBLIC_BUCKET_ID", process.env.NEXT_PUBLIC_BUCKET_ID);

// Initialize Appwrite SDK
const client = new sdk.Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);

console.log("✅ Appwrite client initialized successfully!");