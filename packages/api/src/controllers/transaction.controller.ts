import type { Request, Response } from "express";
import { createTransactionSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { sendPushNotification } from "../lib/push.js";
import { NotFoundError } from "../lib/errors.js";
import { startOfMonthUtc } from "../lib/calendar.js";
import { ensureDefaultAccount, resolveCategoryId } from "../lib/references.js";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

interface TransactionRow {
  id: string;
  description: string;
  amount: number;
  occurredAt: Date;
  userId: string;
  accountId: string;
  type: string;
  category: { name: string };
}

/**
 * Bentuk response dipertahankan dari kontrak lama agar client lama tetap
 * jalan: { id, description, amount, category (nama), date, userId }.
 * `accountId` dan `type` bersifat aditif — client lama mengabaikannya.
 */
function toResponse(row: TransactionRow) {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category.name,
    date: row.occurredAt.toISOString(),
    userId: row.userId,
    accountId: row.accountId,
    type: row.type,
  };
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createTransactionSchema.parse(req.body);

  const accountId = input.accountId ?? (await ensureDefaultAccount(userId));
  const categoryId =
    input.categoryId ?? (await resolveCategoryId(userId, input.category));

  // Pastikan akun milik pengguna (bila client mengirim ID langsung).
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  });

  if (!account) {
    throw new NotFoundError("Akun tidak ditemukan.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      description: input.description,
      amount: input.amount,
      type: "EXPENSE",
      categoryId,
      accountId: account.id,
      userId,
    },
    include: { category: { select: { name: true } } },
  });

  // Notifikasi tidak boleh menahan response.
  void sendPushNotification(userId, {
    title: "Catatan tersimpan",
    body: `${input.description} sebesar ${formatRupiah(input.amount)}`,
    url: "/dashboard",
  });

  res
    .status(201)
    .json({ message: "Catatan berhasil disimpan.", data: toResponse(transaction) });
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

  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { category: { select: { name: true } } },
  });

  const hasMore = rows.length > pageSize;
  const data = (hasMore ? rows.slice(0, pageSize) : rows).map(toResponse);

  res.status(200).json({
    data,
    nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
  });
}

/** Ringkasan bulan berjalan, dihitung di server dengan zona waktu pengguna. */
export async function getMonthlySummary(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const monthStart = startOfMonthUtc(new Date());

  const [monthly, recurringRules, user] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", occurredAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.recurringRule.findMany({
      where: { userId, isActive: true },
      select: { amount: true },
    }),
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
  const totalFixed = recurringRules.reduce((sum, rule) => sum + rule.amount, 0);
  const savings = user.isPercentTarget
    ? (user.monthlyIncome * user.savingsTarget) / 100
    : user.savingsTarget;

  res.status(200).json({
    dailyLimit: user.dailyLimit,
    monthlyIncome: user.monthlyIncome,
    spentThisMonth,
    transactionCount: monthly._count,
    totalFixed,
    monthlyBudgetFree: user.monthlyIncome - savings - spentThisMonth - totalFixed,
  });
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;

  const deleted = await prisma.transaction.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Transaksi tidak ditemukan.");
  }

  res.status(200).json({ message: "Transaksi berhasil dihapus." });
}
