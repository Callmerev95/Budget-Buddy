import type { Request, Response } from "express";
import {
  addGoalProgressSchema,
  createAccountSchema,
  createBudgetSchema,
  createCategorySchema,
  createGoalSchema,
  idParamSchema,
  monthQuerySchema,
} from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../lib/errors.js";
import { AppError } from "../lib/errors.js";
import { JAKARTA_TIME_ZONE, toCalendarDay } from "../lib/calendar.js";
import { signedFlowAmount } from "../domain/finance.js";

/**
 * Endpoint katalog untuk UI baru (Fase 4): akun, kategori, budget, goals,
 * dan agregat laporan. Semua ter-scope userId lewat guard + where eksplisit.
 */

// ── Accounts ────────────────────────────────────────────────────────────────

export async function listAccounts(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const [accounts, sums] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  // Saldo = saldo awal + mutasi bertanda: pengeluaran dikurangi, pemasukan
  // ditambah. Baris transfer keluar negatif dan masuk positif, jadi keduanya
  // diteruskan apa adanya.
  const flowByAccount = new Map<string, number>();
  for (const row of sums) {
    const current = flowByAccount.get(row.accountId) ?? 0;
    flowByAccount.set(
      row.accountId,
      current + signedFlowAmount(row.type, row._sum.amount ?? 0),
    );
  }

  res.status(200).json({
    data: accounts.map((account) => ({
      ...account,
      balance: account.initialBalance + (flowByAccount.get(account.id) ?? 0),
    })),
  });
}

export async function createAccount(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createAccountSchema.parse(req.body);

  const count = await prisma.account.count({ where: { userId } });

  const account = await prisma.account.create({
    data: { ...input, userId, sortOrder: count },
  });

  res.status(201).json({ message: "Akun berhasil dibuat.", data: account });
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { id } = idParamSchema.parse(req.params);

  try {
    const deleted = await prisma.account.deleteMany({ where: { id, userId } });

    if (deleted.count === 0) {
      throw new NotFoundError("Akun tidak ditemukan.");
    }
  } catch (error) {
    // Akun yang sudah dipakai transaksi tidak boleh hilang (Restrict).
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      throw new AppError(
        409,
        "Akun ini sudah dipakai transaksi dan tidak bisa dihapus. Arsipkan saja.",
        "account_in_use",
      );
    }
    throw error;
  }

  res.status(200).json({ message: "Akun berhasil dihapus." });
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  res.status(200).json({ data: categories });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createCategorySchema.parse(req.body);

  const category = await prisma.category.create({ data: { ...input, userId } });

  res.status(201).json({ message: "Kategori berhasil dibuat.", data: category });
}

// ── Budgets ─────────────────────────────────────────────────────────────────

function resolveMonth(
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

export async function listBudgets(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { month } = monthQuerySchema.parse(req.query);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timeZone = user?.timezone || JAKARTA_TIME_ZONE;
  const { start, end } = resolveMonth(month, timeZone);

  const budgets = await prisma.budget.findMany({
    where: { userId, periodStart: { gte: start, lt: end } },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    orderBy: { amount: "desc" },
  });

  const spent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const spentByCategory = new Map(
    spent.map((row) => [row.categoryId, row._sum.amount ?? 0]),
  );

  res.status(200).json({
    data: budgets.map((budget) => ({
      ...budget,
      spent: spentByCategory.get(budget.categoryId) ?? 0,
    })),
  });
}

export async function createBudget(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createBudgetSchema.parse(req.body);

  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, OR: [{ userId: null }, { userId }] },
    select: { id: true },
  });

  if (!category) {
    throw new NotFoundError("Kategori tidak ditemukan.");
  }

  const budget = await prisma.budget.create({
    data: { ...input, userId, categoryId: category.id },
  });

  res.status(201).json({ message: "Budget berhasil dibuat.", data: budget });
}

export async function deleteBudget(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { id } = idParamSchema.parse(req.params);

  const deleted = await prisma.budget.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Budget tidak ditemukan.");
  }

  res.status(200).json({ message: "Budget berhasil dihapus." });
}

// ── Goals ───────────────────────────────────────────────────────────────────

export async function listGoals(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ data: goals });
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const input = createGoalSchema.parse(req.body);

  if (input.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, userId },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundError("Akun tidak ditemukan.");
    }
  }

  const goal = await prisma.savingsGoal.create({ data: { ...input, userId } });

  res.status(201).json({ message: "Target berhasil dibuat.", data: goal });
}

export async function addGoalProgress(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { id } = idParamSchema.parse(req.params);
  const { amount } = addGoalProgressSchema.parse(req.body);

  const goal = await prisma.savingsGoal.findFirst({ where: { id, userId } });

  if (!goal) {
    throw new NotFoundError("Target tidak ditemukan.");
  }

  const updated = await prisma.savingsGoal.updateMany({
    where: { id: goal.id, userId },
    data: { saved: { increment: amount } },
  });

  if (updated.count === 0) {
    throw new NotFoundError("Target tidak ditemukan.");
  }

  res.status(200).json({ message: "Tabungan tercatat.", data: updated });
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { id } = idParamSchema.parse(req.params);

  const deleted = await prisma.savingsGoal.deleteMany({ where: { id, userId } });

  if (deleted.count === 0) {
    throw new NotFoundError("Target tidak ditemukan.");
  }

  res.status(200).json({ message: "Target berhasil dihapus." });
}
