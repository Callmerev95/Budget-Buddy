import type { Request, Response } from "express";
import { occurrenceMonthSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { recordNotification } from "../lib/notifications.js";
import { NotFoundError } from "../lib/errors.js";
import { AppError } from "../lib/errors.js";
import { JAKARTA_TIME_ZONE, toCalendarDay } from "../lib/calendar.js";

/**
 * Endpoint occurrence untuk UI tagihan (Fase 4/5).
 *
 * Route `/fixed-expenses` tetap ada untuk kompatibilitas client lama;
 * endpoint di sini bekerja pada level occurrence (jatuh tempo per periode),
 * bukan rule.
 */

interface MonthQuery {
  month?: string;
}

function monthRange(
  month: string | undefined,
  timeZone: string,
): { start: Date; end: Date } {
  const base = month ?? toCalendarDay(new Date(), timeZone).slice(0, 7);
  const [yearText, monthText] = base.split("-");
  const year = Number(yearText);
  const m = Number(monthText);

  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
}

export async function listOccurrences(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const query = occurrenceMonthSchema.parse(req.query) as MonthQuery;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });

  const { start, end } = monthRange(query.month, user?.timezone || JAKARTA_TIME_ZONE);

  const occurrences = await prisma.recurringOccurrence.findMany({
    where: {
      rule: { userId },
      dueDate: { gte: start, lt: end },
    },
    orderBy: { dueDate: "asc" },
    include: {
      rule: { select: { id: true, name: true, amount: true } },
    },
  });

  res.status(200).json({ data: occurrences });
}

/** Ambil occurrence milik pengguna — menolak milik orang lain. */
async function getOwnedOccurrence(userId: string, id: string) {
  const occurrence = await prisma.recurringOccurrence.findFirst({
    where: { id, rule: { userId } },
    include: {
      rule: {
        select: { id: true, name: true, amount: true, accountId: true, categoryId: true },
      },
    },
  });

  if (!occurrence) {
    throw new NotFoundError("Tagihan tidak ditemukan.");
  }

  return occurrence;
}

export async function payOccurrence(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;
  const occurrence = await getOwnedOccurrence(userId, id);

  if (occurrence.status === "PAID") {
    res.status(200).json({ message: "Tagihan ini sudah dibayar.", data: occurrence });
    return;
  }

  if (occurrence.status !== "PENDING") {
    throw new AppError(409, "Tagihan ini sudah dilewati.", "occurrence_not_pending");
  }

  const transaction = await prisma.transaction.create({
    data: {
      description: `Pembayaran ${occurrence.rule.name}`,
      amount: occurrence.rule.amount,
      type: "EXPENSE",
      categoryId: occurrence.rule.categoryId,
      accountId: occurrence.rule.accountId,
      recurringRuleId: occurrence.rule.id,
      userId,
    },
  });

  const updated = await prisma.recurringOccurrence.update({
    where: { id: occurrence.id },
    data: { status: "PAID", transactionId: transaction.id },
  });

  void recordNotification(
    userId,
    "PAYMENT_RECEIVED",
    `${occurrence.rule.name} berhasil dibayar`,
    `Pembayaran ${occurrence.rule.name} sebesar Rp ${occurrence.rule.amount.toLocaleString("id-ID")} tercatat.`,
  );

  res
    .status(200)
    .json({ message: `${occurrence.rule.name} berhasil dibayar.`, data: updated });
}

export async function skipOccurrence(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;
  const occurrence = await getOwnedOccurrence(userId, id);

  if (occurrence.status !== "PENDING") {
    throw new AppError(
      409,
      "Hanya tagihan menunggu yang bisa dilewati.",
      "occurrence_not_pending",
    );
  }

  const updated = await prisma.recurringOccurrence.update({
    where: { id: occurrence.id },
    data: { status: "SKIPPED" },
  });

  res.status(200).json({ message: "Tagihan dilewati untuk periode ini.", data: updated });
}
