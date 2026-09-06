import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { sendPushNotification } from "../lib/push.js";
import { AppError } from "../lib/errors.js";
import { effectiveDueDate } from "../domain/finance.js";
import { startOfMonthUtc, toCalendarDay } from "../lib/calendar.js";

/** Jumlah tagihan yang diproses per invocation, menjaga durasi function tetap aman. */
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
 * Catatan keterbatasan yang diketahui: deteksi "sudah dibayar" masih memakai
 * pencocokan teks deskripsi, sehingga transaksi lain yang memuat nama tagihan
 * bisa dianggap pembayaran. Tabel `RecurringOccurrence` pada Fase 2 akan
 * menggantikan pendekatan ini dengan kunci idempoten `(ruleId, periodKey)`.
 */
export async function runDailyReminders(req: Request, res: Response): Promise<void> {
  assertCronCaller(req);

  const now = new Date();
  const [yearText, monthText, dayText] = toCalendarDay(now).split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const today = Number(dayText);
  const monthStart = startOfMonthUtc(now);

  const expenses = await prisma.recurringRule.findMany({
    where: { isActive: true },
    take: BATCH_SIZE,
    orderBy: { id: "asc" },
    select: { id: true, name: true, amount: true, dayOfMonth: true, userId: true },
  });

  let notified = 0;

  for (const expense of expenses) {
    if (effectiveDueDate(expense.dayOfMonth, year, month) !== today) continue;

    const alreadyPaid = await prisma.transaction.findFirst({
      where: {
        userId: expense.userId,
        description: { contains: expense.name, mode: "insensitive" },
        occurredAt: { gte: monthStart },
      },
      select: { id: true },
    });

    if (alreadyPaid) continue;

    await sendPushNotification(expense.userId, {
      title: `Tagihan ${expense.name}`,
      body: `Waktunya membayar ${expense.name} sebesar Rp ${expense.amount.toLocaleString("id-ID")}.`,
      url: "/dashboard",
    });

    notified += 1;
  }

  res.status(200).json({
    ok: true,
    date: toCalendarDay(now),
    scanned: expenses.length,
    notified,
  });
}
