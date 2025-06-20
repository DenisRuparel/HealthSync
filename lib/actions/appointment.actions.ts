"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_DATABASE_ID,
  NEXT_PUBLIC_PATIENTS_COLLECTION_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    // Populate patient data for each appointment
    const appointmentsWithPatients = await Promise.all(
      appointments.documents.map(async (appointment: any) => {
        try {
          // Get patient data if patient field exists and is a string (patient ID)
          if (appointment.patient && typeof appointment.patient === 'string') {
            const patient = await databases.getDocument(
              NEXT_PUBLIC_DATABASE_ID!,
              NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
              appointment.patient
            );
            return {
              ...appointment,
              patient: patient
            };
          }
          return appointment;
        } catch (error) {
          console.error(`Error fetching patient for appointment ${appointment.$id}:`, error);
          // Return appointment with null patient if patient fetch fails
          return {
            ...appointment,
            patient: null
          };
        }
      })
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointmentsWithPatients as Appointment[]).reduce(
      (acc, appointment) => {
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
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointmentsWithPatients,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
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
    // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
    const updatedAppointment = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw Error;

    const smsMessage = `Greetings from HealthSync. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!, timeZone).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!, timeZone).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    // Populate patient data if patient field is a string (patient ID)
    if (appointment.patient && typeof appointment.patient === 'string') {
      try {
        const patient = await databases.getDocument(
          NEXT_PUBLIC_DATABASE_ID!,
          NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
          appointment.patient
        );
        appointment.patient = patient;
      } catch (error) {
        console.error(`Error fetching patient for appointment ${appointmentId}:`, error);
        appointment.patient = null;
      }
    }

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing appointment:",
      error
    );
  }
};