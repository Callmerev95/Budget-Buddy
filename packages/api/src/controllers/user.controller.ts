import type { Request, Response } from "express";
import { financialPlanSchema } from "@budget-buddy/shared";
import { getAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { calculateDailyAllowance } from "../domain/finance.js";
import { NotFoundError } from "../lib/errors.js";

export async function getMe(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      dailyLimit: true,
      monthlyIncome: true,
      savingsTarget: true,
      isPercentTarget: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Profil pengguna tidak ditemukan.");
  }

  res.status(200).json(user);
}

export async function updateFinancialPlan(req: Request, res: Response): Promise<void> {
  const { userId } = getAuth(req);
  const plan = financialPlanSchema.parse(req.body);

  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { userId },
    select: { amount: true },
  });

  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const dailyLimit = calculateDailyAllowance({
    monthlyIncome: plan.monthlyIncome,
    savingsTarget: plan.savingsTarget,
    isPercentTarget: plan.isPercentTarget,
    totalFixed,
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyIncome: plan.monthlyIncome,
      savingsTarget: plan.savingsTarget,
      isPercentTarget: plan.isPercentTarget,
      dailyLimit,
    },
    select: {
      id: true,
      name: true,
      email: true,
      dailyLimit: true,
      monthlyIncome: true,
      savingsTarget: true,
      isPercentTarget: true,
    },
  });

  res.status(200).json({ message: "Rencana keuangan diperbarui.", user });
}
