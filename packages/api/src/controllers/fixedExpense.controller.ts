import type { Request, Response } from "express";
import { BILL_CATEGORY, createFixedExpenseSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { recordNotification } from "../lib/notifications.js";
import { NotFoundError } from "../lib/errors.js";
import { ensureDefaultAccount, resolveCategoryId } from "../lib/references.js";

interface RuleRow {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  userId: string;
}

/**
 * Bentuk response dipertahankan dari kontrak lama: { id, name, amount,
 * dueDate, userId }. Di dalam, tagihan adalah RecurringRule dengan
 * dayOfMonth — engine occurrence menyusul di Fase 3.
 */
function toResponse(rule: RuleRow) {
  return {
    id: rule.id,
    name: rule.name,
    amount: rule.amount,
    dueDate: rule.dayOfMonth,
    userId: rule.userId,
  };
}

export async function listFixedExpenses(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const rules = await prisma.recurringRule.findMany({
    where: { userId },
    orderBy: { dayOfMonth: "asc" },
  });

  res.status(200).json({ data: rules.map(toResponse) });
}

export async function createFixedExpense(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createFixedExpenseSchema.parse(req.body);

  const accountId = await ensureDefaultAccount(userId);
  const categoryId = await resolveCategoryId(userId, BILL_CATEGORY);

  const rule = await prisma.recurringRule.create({
    data: {
      name: input.name,
      amount: input.amount,
      dayOfMonth: input.dueDate,
      accountId,
      categoryId,
      userId,
    },
  });

  res.status(201).json({ message: "Tagihan berhasil disimpan.", data: toResponse(rule) });
}

export async function deleteFixedExpense(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;

  const deleted = await prisma.recurringRule.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Tagihan tidak ditemukan.");
  }

  res.status(200).json({ message: "Tagihan berhasil dihapus." });
}

/**
 * Mencatat pembayaran tagihan sebagai transaksi pada kategori rule tersebut.
 * Format deskripsi dipertahankan agar deteksi scheduler lama tetap jalan
 * sampai digantikan RecurringOccurrence di Fase 3.
 */
export async function payFixedExpense(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const id = req.params.id as string;

  const rule = await prisma.recurringRule.findFirst({ where: { id, userId } });

  if (!rule) {
    throw new NotFoundError("Tagihan tidak ditemukan.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      description: `Pembayaran ${rule.name}`,
      amount: rule.amount,
      type: "EXPENSE",
      categoryId: rule.categoryId,
      accountId: rule.accountId,
      userId,
    },
  });

  void recordNotification(
    userId,
    "PAYMENT_RECEIVED",
    `${rule.name} berhasil dibayar`,
    `Pembayaran ${rule.name} sebesar Rp ${rule.amount.toLocaleString("id-ID")} tercatat.`,
  );

  res.status(201).json({
    message: `${rule.name} berhasil dibayar.`,
    data: transaction,
  });
}
