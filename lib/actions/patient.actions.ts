// "use server";

// import { InputFile } from 'node-appwrite/file';
// import { ID, Query } from "node-appwrite";

// import {
//   BUCKET_ID,
//   NEXT_PUBLIC_DATABASE_ID,
//   ENDPOINT,
//   NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
//   PROJECT_ID,
//   databases,
//   storage,
//   users,
// } from "../appwrite.config";
// import { parseStringify } from "../utils";

// // CREATE APPWRITE USER
// export const createUser = async (user: CreateUserParams) => {
//   try {
//     // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
//     const newuser = await users.create(
//       ID.unique(),
//       user.email,
//       user.phone,
//       undefined,
//       user.name
//     );

//     return parseStringify(newuser);
//   } catch (error: any) {
//     // Check existing user
//     if (error && error?.code === 409) {
//       const existingUser = await users.list([
//         Query.equal("email", [user.email]),
//       ]);

//       return existingUser.users[0];
//     }
//     console.error("An error occurred while creating a new user:", error);
//   }
// };

// // GET USER
// export const getUser = async (userId: string) => {
//   try {
//     const user = await users.get(userId);

//     return parseStringify(user);
//   } catch (error) {
//     console.error(
//       "An error occurred while retrieving the user details:",
//       error
//     );
//   }
// };

// // REGISTER PATIENT
// export const registerPatient = async ({ identificationDocument, ...patient }: RegisterUserParams) => {
//   try {
//     // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
//     let file;
//     if (identificationDocument) {
//       const inputFile =
//         identificationDocument &&
//         InputFile.fromBuffer(
//           identificationDocument?.get("blobFile") as Blob,
//           identificationDocument?.get("fileName") as string
//         );

//       file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
//     }

//     console.log(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
//     )

//     // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument

//     const newPatient = await databases.createDocument(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
//       ID.unique(),
//       {
//         identificationDocumentId: file?.$id ? file.$id : null,
//         identificationDocumentUrl: file?.$id
//           ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
//           : null,
//         ...patient,
//       }
//     );

//     return parseStringify(newPatient);
//   } catch (error) {
//     console.error("An error occurred while creating a new patient:", error);
//   }
// };

// // GET PATIENT
// export const getPatient = async (userId: string) => {
//   try {
//     const patients = await databases.listDocuments(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
//       [Query.equal("userId", [userId])]
//     );

//     return parseStringify(patients.documents[0]);
//   } catch (error) {
//     console.error(
//       "An error occurred while retrieving the patient details:",
//       error
//     );
//   }
// };

"use server";

import { InputFile } from 'node-appwrite/file';
import { ID, Query } from "node-appwrite";

import {
  BUCKET_ID,
  NEXT_PUBLIC_DATABASE_ID,
  ENDPOINT,
  NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// 🚨 Validate environment variables
if (!NEXT_PUBLIC_DATABASE_ID || !NEXT_PUBLIC_PATIENTS_COLLECTION_ID || !BUCKET_ID || !PROJECT_ID || !ENDPOINT) {
  throw new Error("🚨 Missing required environment variables. Check your .env.local file!");
}

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Handle existing user
    if (error?.code === 409) {
      const existingUser = await users.list([Query.equal("email", [user.email])]);

      if (existingUser.total > 0) {
        return parseStringify(existingUser.users[0]);
      }
    }
    console.error("🚨 Error creating a new user:", error);
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error("🚨 Error retrieving user details:", error);
  }
};

// REGISTER PATIENT
export const registerPatient = async ({ identificationDocument, ...patient }: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument && identificationDocument.get("blobFile") && identificationDocument.get("fileName")) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument.get("blobFile") as Blob,
        identificationDocument.get("fileName") as string
      );

      file = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
    }

    console.log("📌 Database ID:", NEXT_PUBLIC_DATABASE_ID);
    console.log("📌 Patients Collection ID:", NEXT_PUBLIC_PATIENTS_COLLECTION_ID);

    const newPatient = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("🚨 Error creating a new patient:", error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    return patients.total > 0 ? parseStringify(patients.documents[0]) : null;
  } catch (error) {
    console.error("🚨 Error retrieving patient details:", error);
  }
};