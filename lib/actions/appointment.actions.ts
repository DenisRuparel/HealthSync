// "use server";

// import { revalidatePath } from "next/cache";
// import { ID, Query } from "node-appwrite";

// import { Appointment } from "@/types/appwrite.types";

// import {
//   NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
//   NEXT_PUBLIC_DATABASE_ID,
//   databases,
//   messaging,
// } from "../appwrite.config";
// import { formatDateTime, parseStringify } from "../utils";

// //  CREATE APPOINTMENT
// export const createAppointment = async (
//   appointment: CreateAppointmentParams
// ) => {
//   try {
//     const newAppointment = await databases.createDocument(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
//       ID.unique(),
//       appointment
//     );

//     revalidatePath("/admin");
//     return parseStringify(newAppointment);
//   } catch (error) {
//     console.error("An error occurred while creating a new appointment:", error);
//   }
// };

// //  GET RECENT APPOINTMENTS
// export const getRecentAppointmentList = async () => {
//   try {
//     const appointments = await databases.listDocuments(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
//       [Query.orderDesc("$createdAt")]
//     );

//     // const scheduledAppointments = (
//     //   appointments.documents as Appointment[]
//     // ).filter((appointment) => appointment.status === "scheduled");

//     // const pendingAppointments = (
//     //   appointments.documents as Appointment[]
//     // ).filter((appointment) => appointment.status === "pending");

//     // const cancelledAppointments = (
//     //   appointments.documents as Appointment[]
//     // ).filter((appointment) => appointment.status === "cancelled");

//     // const data = {
//     //   totalCount: appointments.total,
//     //   scheduledCount: scheduledAppointments.length,
//     //   pendingCount: pendingAppointments.length,
//     //   cancelledCount: cancelledAppointments.length,
//     //   documents: appointments.documents,
//     // };

//     const initialCounts = {
//       scheduledCount: 0,
//       pendingCount: 0,
//       cancelledCount: 0,
//     };

//     const counts = (appointments.documents as Appointment[]).reduce(
//       (acc, appointment) => {
//         switch (appointment.status) {
//           case "scheduled":
//             acc.scheduledCount++;
//             break;
//           case "pending":
//             acc.pendingCount++;
//             break;
//           case "cancelled":
//             acc.cancelledCount++;
//             break;
//         }
//         return acc;
//       },
//       initialCounts
//     );

//     const data = {
//       totalCount: appointments.total,
//       ...counts,
//       documents: appointments.documents,
//     };

//     return parseStringify(data);
//   } catch (error) {
//     console.error(
//       "An error occurred while retrieving the recent appointments:",
//       error
//     );
//   }
// };

// //  SEND SMS NOTIFICATION
// export const sendSMSNotification = async (userId: string, content: string) => {
//   try {
//     // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
//     const message = await messaging.createSms(
//       ID.unique(),
//       content,
//       [],
//       [userId]
//     );
//     return parseStringify(message);
//   } catch (error) {
//     console.error("An error occurred while sending sms:", error);
//   }
// };

// //  UPDATE APPOINTMENT
// export const updateAppointment = async ({
//   appointmentId,
//   userId,
//   timeZone,
//   appointment,
//   type,
// }: UpdateAppointmentParams) => {
//   try {
//     // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
//     const updatedAppointment = await databases.updateDocument(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
//       appointmentId,
//       appointment
//     );

//     if (!updatedAppointment) throw Error;

//     const smsMessage = `Greetings from HealthSync. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!, timeZone).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!, timeZone).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
//     await sendSMSNotification(userId, smsMessage);

//     revalidatePath("/admin");
//     return parseStringify(updatedAppointment);
//   } catch (error) {
//     console.error("An error occurred while scheduling an appointment:", error);
//   }
// };

// // GET APPOINTMENT
// export const getAppointment = async (appointmentId: string) => {
//   try {
//     const appointment = await databases.getDocument(
//       NEXT_PUBLIC_DATABASE_ID!,
//       NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
//       appointmentId
//     );

//     return parseStringify(appointment);
//   } catch (error) {
//     console.error(
//       "An error occurred while retrieving the existing patient:",
//       error
//     );
//   }
// };



"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";
import {
  NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

// 🚨 Validate environment variables
if (!NEXT_PUBLIC_DATABASE_ID || !NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID) {
  throw new Error("🚨 Missing required environment variables. Check .env.local!");
}

//  CREATE APPOINTMENT
export const createAppointment = async (appointment: CreateAppointmentParams) => {
  try {
    if (!appointment) throw new Error("🚨 Appointment data is missing!");

    const newAppointment = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("🚨 Error creating appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    console.log("📌 Fetching appointments from database:", NEXT_PUBLIC_DATABASE_ID);
    console.log("📌 Collection ID:", NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID);

    const appointments = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    if (!appointments || !appointments.documents) {
      throw new Error("🚨 No appointments found or response is undefined!");
    }

    const initialCounts = { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 };

    const counts = (appointments.documents ?? []).reduce((acc, appointment) => {
      switch (appointment.status) {
        case "scheduled":
          acc.scheduledCount++;
          break;
        case "pending":
          acc.pendingCount++;
          break;
        case "cancelled":
          acc.cancelledCount++;
          break;
      }
      return acc;
    }, { ...initialCounts });

    return parseStringify({
      totalCount: appointments.total ?? 0,
      ...counts,
      documents: appointments.documents ?? [],
    });
  } catch (error) {
    console.error("🚨 Error retrieving recent appointments:", error);
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    if (!userId || !content) throw new Error("🚨 User ID or content is missing!");

    const message = await messaging.createSms(ID.unique(), content, [], [userId]);

    return parseStringify(message);
  } catch (error) {
    console.error("🚨 Error sending SMS:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    if (!appointmentId || !appointment) throw new Error("🚨 Missing appointment data!");

    const updatedAppointment = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw new Error("🚨 Failed to update appointment!");

    const smsMessage = `Greetings from HealthSync. ${
      type === "schedule"
        ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!, timeZone).dateTime} with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!, timeZone).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`
    }`;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("🚨 Error updating appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    if (!appointmentId) throw new Error("🚨 Appointment ID is missing!");

    const appointment = await databases.getDocument(
      NEXT_PUBLIC_DATABASE_ID,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error("🚨 Error retrieving appointment:", error);
  }
};