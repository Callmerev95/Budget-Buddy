import type { Request, Response } from "express";
import { createTransactionSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { sendPushNotification } from "../lib/push.js";
import { NotFoundError } from "../lib/errors.js";
import { startOfMonthUtc } from "../lib/calendar.js";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createTransactionSchema.parse(req.body);

  const transaction = await prisma.dailyLog.create({
    data: {
      description: input.description,
      amount: input.amount,
      category: input.category,
      userId,
    },
  });

  // Notifikasi tidak boleh menahan response.
  void sendPushNotification(userId, {
    title: "Catatan tersimpan",
    body: `${input.description} sebesar ${formatRupiah(input.amount)}`,
    url: "/dashboard",
  });

  res.status(201).json({ message: "Catatan berhasil disimpan.", data: transaction });
}

/**
 * Daftar transaksi dengan cursor pagination.
 *
 * Endpoint lama mengirim seluruh riwayat tanpa batas, lalu client melakukan
 * semua agregasi. Dengan kuota egress bersama antar pengguna, itu tidak
 * berkelanjutan.
 */
export async function listTransactions(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const requestedSize = Number(req.query.limit ?? DEFAULT_PAGE_SIZE);
  const pageSize = Number.isFinite(requestedSize)
    ? Math.min(Math.max(Math.trunc(requestedSize), 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const rows = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > pageSize;
  const data = hasMore ? rows.slice(0, pageSize) : rows;

  res.status(200).json({
    data,
    nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
  });
}

/** Ringkasan bulan berjalan, dihitung di server dengan zona waktu pengguna. */
export async function getMonthlySummary(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const monthStart = startOfMonthUtc(new Date());

  const [monthly, fixedExpenses, user] = await Promise.all([
    prisma.dailyLog.aggregate({
      where: { userId, date: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fixedExpense.findMany({ where: { userId }, select: { amount: true } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyLimit: true,
        monthlyIncome: true,
        savingsTarget: true,
        isPercentTarget: true,
      },
    }),
  ]);

  if (!user) {
    throw new NotFoundError("Profil pengguna tidak ditemukan.");
  }

  const spentThisMonth = monthly._sum.amount ?? 0;
  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savings = user.isPercentTarget
    ? (user.monthlyIncome * user.savingsTarget) / 100
    : user.savingsTarget;

  res.status(200).json({
    dailyLimit: user.dailyLimit,
    monthlyIncome: user.monthlyIncome,
    spentThisMonth,
    transactionCount: monthly._count,
    totalFixed,
    // Bug lama: nilai ini memakai total belanja seumur hidup, bukan bulan ini.
    monthlyBudgetFree: user.monthlyIncome - savings - spentThisMonth - totalFixed,
  });
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;

  const deleted = await prisma.dailyLog.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Transaksi tidak ditemukan.");
  }

  res.status(200).json({ message: "Transaksi berhasil dihapus." });
}
