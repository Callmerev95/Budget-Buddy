import type { Request, Response } from "express";
import { BILL_CATEGORY, createFixedExpenseSchema } from "@budget-buddy/shared";
import { getAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../lib/errors.js";

export async function listFixedExpenses(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);

  const expenses = await prisma.fixedExpense.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });

  res.status(200).json({ data: expenses });
}

export async function createFixedExpense(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);
  const input = createFixedExpenseSchema.parse(req.body);

  const expense = await prisma.fixedExpense.create({
    data: {
      name: input.name,
      amount: input.amount,
      dueDate: input.dueDate,
      userId,
    },
  });

  res.status(201).json({ message: "Tagihan berhasil disimpan.", data: expense });
}

export async function deleteFixedExpense(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);
  const id = req.params.id as string;

  const deleted = await prisma.fixedExpense.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Tagihan tidak ditemukan.");
  }

  res.status(200).json({ message: "Tagihan berhasil dihapus." });
}

/**
 * Mencatat pembayaran tagihan sebagai transaksi.
 *
 * Controller lama punya fungsi serupa yang tidak pernah dipasang ke route mana
 * pun, sementara client mengirim POST /transactions dengan deskripsi bebas.
 * Pencatatan lewat endpoint ini menjaga format deskripsi tetap konsisten.
 */
export async function payFixedExpense(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);
  const id = req.params.id as string;

  const expense = await prisma.fixedExpense.findFirst({ where: { id, userId } });

  if (!expense) {
    throw new NotFoundError("Tagihan tidak ditemukan.");
  }

  const transaction = await prisma.dailyLog.create({
    data: {
      description: `Pembayaran ${expense.name}`,
      amount: expense.amount,
      category: BILL_CATEGORY,
      userId,
    },
  });

  res.status(201).json({
    message: `${expense.name} berhasil dibayar.`,
    data: transaction,
  });
}
