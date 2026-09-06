import { prismaSystem } from "../lib/prisma.js";
import { recordNotification } from "../lib/notifications.js";
import { sendPushNotification } from "../lib/push.js";
import type { EngineStore } from "./recurring.js";

/**
 * Implementasi EngineStore di atas Prisma.
 *
 * Memakai `prismaSystem` (tanpa tenancy guard) karena cron bekerja lintas
 * pengguna — scoping dijamin oleh pemanggil yang hanya memuat rule aktif,
 * dan setiap operasi occurrence selalu membawa ruleId milik pengguna tersebut.
 */
export function createPrismaStore(): EngineStore {
  return {
    findOccurrence: (ruleId, periodKey) =>
      prismaSystem.recurringOccurrence.findUnique({
        where: { ruleId_periodKey: { ruleId, periodKey } },
      }),
    createOccurrence: (input) => prismaSystem.recurringOccurrence.create({ data: input }),
    createTransaction: (input) =>
      prismaSystem.transaction.create({
        data: { ...input, type: "EXPENSE" },
        select: { id: true },
      }),
    markPaid: (occurrenceId, transactionId) =>
      prismaSystem.recurringOccurrence
        .update({
          where: { id: occurrenceId },
          data: { status: "PAID", transactionId },
        })
        .then(() => undefined),
    markNotified: (occurrenceId, at) =>
      prismaSystem.recurringOccurrence
        .update({ where: { id: occurrenceId }, data: { notifiedAt: at } })
        .then(() => undefined),
    // notify hanya dipanggil engine pada jalur pengingat (bukan autopost),
    // jadi tipenya selalu BILL_DUE. Autopost dicatat PAYMENT_RECEIVED
    // oleh pemanggil (cron controller) yang memegang data rule.
    notify: (userId, title, body) => {
      void recordNotification(userId, "BILL_DUE", title, body);
      return sendPushNotification(userId, { title, body, url: "/dashboard" });
    },
  };
}
