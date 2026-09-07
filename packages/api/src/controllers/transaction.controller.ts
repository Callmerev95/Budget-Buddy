import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import {
  createTransactionSchema,
  createTransferSchema,
  exportQuerySchema,
} from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { recordNotification } from "../lib/notifications.js";
import { sendPushNotification } from "../lib/push.js";
import { NotFoundError } from "../lib/errors.js";
import { startOfMonthUtc } from "../lib/calendar.js";
import { ensureDefaultAccount, resolveCategoryId } from "../lib/references.js";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;
const MAX_EXPORT_ROWS = 5000;

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
  const kind = input.type === "INCOME" ? "INCOME" : "EXPENSE";
  const categoryId =
    input.categoryId ?? (await resolveCategoryId(userId, input.category, kind));

  // Pastikan akun milik pengguna (bila client mengirim ID langsung).
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  });

  if (!account) {
    throw new NotFoundError("Akun tidak ditemukan.");
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, OR: [{ userId: null }, { userId }] },
    select: { id: true },
  });

  if (!category) {
    throw new NotFoundError("Kategori tidak ditemukan.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: category.id,
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
  void recordNotification(
    userId,
    "TRANSACTION_RECORDED",
    "Catatan tersimpan",
    `${input.description} sebesar ${formatRupiah(input.amount)}.`,
  );

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

  const [monthly, incomeAggregate, recurringRules, user] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", occurredAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", occurredAt: { gte: monthStart } },
      _sum: { amount: true },
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

  const incomeThisMonth = incomeAggregate._sum.amount ?? 0;
  const spentThisMonth = monthly._sum.amount ?? 0;
  const totalFixed = recurringRules.reduce((sum, rule) => sum + rule.amount, 0);
  const savings = user.isPercentTarget
    ? (user.monthlyIncome * user.savingsTarget) / 100
    : user.savingsTarget;

  res.status(200).json({
    dailyLimit: user.dailyLimit,
    monthlyIncome: user.monthlyIncome,
    incomeThisMonth,
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

/**
 * Transfer antar akun milik pengguna yang sama.
 *
 * Dicatat sebagai dua baris atomik dengan transferGroupId sama: baris keluar
 * bernilai negatif, baris masuk positif. Tanda inilah yang menentukan arah —
 * field terpisah tidak diperlukan.
 */
export async function createTransfer(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createTransferSchema.parse(req.body);

  const accounts = await prisma.account.findMany({
    where: { id: { in: [input.fromAccountId, input.toAccountId] }, userId },
    select: { id: true },
  });

  if (accounts.length !== 2) {
    throw new NotFoundError("Salah satu akun tidak ditemukan.");
  }

  const groupId = randomUUID();
  const description =
    input.description === "Transfer" ? "Transfer antar akun" : input.description;

  const [outgoing, incoming] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        description: `${description} (keluar)`,
        amount: -input.amount,
        type: "TRANSFER",
        categoryId: await resolveCategoryId(userId, "Lainnya", "EXPENSE"),
        accountId: input.fromAccountId,
        transferGroupId: groupId,
        userId,
      },
    }),
    prisma.transaction.create({
      data: {
        description: `${description} (masuk)`,
        amount: input.amount,
        type: "TRANSFER",
        categoryId: await resolveCategoryId(userId, "Lainnya", "EXPENSE"),
        accountId: input.toAccountId,
        transferGroupId: groupId,
        userId,
      },
    }),
  ]);

  res.status(201).json({
    message: "Transfer berhasil dicatat.",
    data: { groupId, outgoingId: outgoing.id, incomingId: incoming.id },
  });
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Export CSV untuk rentang tanggal. Dibatasi 5000 baris (jauh di bawah
 * limit payload 4.5MB Vercel) — sekaligus menjadi jalur backup manual,
 * mengingat Free plan tidak menyediakan backup yang bisa diunduh.
 */
export async function exportTransactionsCsv(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { from, to } = exportQuerySchema.parse(req.query);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: {
        gte: new Date(from),
        lt: new Date(new Date(to).getTime() + 86_400_000),
      },
    },
    orderBy: { occurredAt: "asc" },
    take: MAX_EXPORT_ROWS + 1,
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const truncated = rows.length > MAX_EXPORT_ROWS;
  const data = truncated ? rows.slice(0, MAX_EXPORT_ROWS) : rows;

  const lines = ["tanggal,jenis,deskripsi,kategori,akun,nominal"];
  for (const row of data) {
    lines.push(
      [
        csvCell(row.occurredAt.toISOString().slice(0, 10)),
        csvCell(row.type),
        csvCell(row.description),
        csvCell(row.category.name),
        csvCell(row.account.name),
        csvCell(row.amount),
      ].join(","),
    );
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="budget-buddy-${from}_${to}.csv"`,
  );
  res
    .status(200)
    .send(
      `\uFEFF${lines.join("\n")}${truncated ? "\n# TERPOTONG: lebih dari 5000 baris, persempit rentang" : ""}`,
    );
}
