import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prismaSystem } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { JAKARTA_TIME_ZONE, toCalendarDay } from "../lib/calendar.js";
import { createPrismaStore } from "../services/recurringStore.js";
import { processRule, type EngineOutcome } from "../services/recurring.js";

/** Jumlah rule yang diproses per invocation, menjaga durasi function tetap aman. */
const BATCH_SIZE = 200;

/**
 * Memverifikasi pemanggil adalah Vercel Cron, bukan pihak luar.
 * Vercel mengirim `Authorization: Bearer $CRON_SECRET`.
 */
function assertCronCaller(req: Request): void {
  if (!env.CRON_SECRET) {
    throw new AppError(503, "Cron belum dikonfigurasi.", "cron_disabled");
  }

  const header = req.headers.authorization;

  if (header !== `Bearer ${env.CRON_SECRET}`) {
    throw new AppError(401, "Tidak diizinkan.", "unauthorized");
  }
}

/**
 * Pengingat tagihan harian, dipanggil oleh Vercel Cron.
 *
 * Idempoten by `(ruleId, periodKey)`: run ulang untuk periode yang sama
 * tidak membuat occurrence ganda dan tidak mengirim notifikasi ganda.
 * Karena itu tidak perlu state cursor antar invocation — run yang kehabisan
 * waktu 300 detik cukup dijalankan ulang, sisanya otomatis dilewati.
 * Bila skala menuntut, tambahkan cursor berbasis rule id di sini.
 */
export async function runDailyReminders(req: Request, res: Response): Promise<void> {
  assertCronCaller(req);

  const now = new Date();
  const store = createPrismaStore();

  const rules = await prismaSystem.recurringRule.findMany({
    where: { isActive: true },
    take: BATCH_SIZE,
    orderBy: { id: "asc" },
    select: {
      id: true,
      userId: true,
      name: true,
      amount: true,
      accountId: true,
      categoryId: true,
      frequency: true,
      dayOfMonth: true,
      endOfMonthClamp: true,
      autoPost: true,
      isActive: true,
      user: { select: { timezone: true } },
    },
  });

  const tally: Record<EngineOutcome, number> = {
    waiting: 0,
    reminded: 0,
    posted: 0,
    skipped: 0,
    unsupported: 0,
  };

  for (const rule of rules) {
    const outcome = await processRule(
      store,
      rule,
      now,
      rule.user.timezone || JAKARTA_TIME_ZONE,
    );
    tally[outcome] += 1;
  }

  res.status(200).json({
    ok: true,
    date: toCalendarDay(now),
    scanned: rules.length,
    ...tally,
  });
}
