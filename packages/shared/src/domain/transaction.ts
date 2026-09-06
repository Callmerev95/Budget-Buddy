import { z } from "zod";
import { ExpenseCategorySchema } from "./category.js";

/**
 * Tipe domain bersama antara web dan api.
 *
 * Sebelumnya `Transaction` didefinisikan dua kali dengan bentuk berbeda
 * (TransactionList dan Dashboard), keduanya tidak diekspor, dan `FixedExpense`
 * tinggal di dalam file komponen.
 */
export const TransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  date: z.string(),
  userId: z.string(),
});

export const FixedExpenseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.number(),
  userId: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  dailyLimit: z.number(),
  monthlyIncome: z.number(),
  savingsTarget: z.number(),
  isPercentTarget: z.boolean(),
});

export const MonthlySummarySchema = z.object({
  dailyLimit: z.number(),
  monthlyIncome: z.number(),
  spentThisMonth: z.number(),
  transactionCount: z.number(),
  totalFixed: z.number(),
  monthlyBudgetFree: z.number(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type FixedExpense = z.infer<typeof FixedExpenseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type MonthlySummary = z.infer<typeof MonthlySummarySchema>;

/** Bentuk minimal transaksi yang dibutuhkan komponen daftar. */
export interface TransactionListItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
}

export const CategoryTotalSchema = z.object({
  category: ExpenseCategorySchema.or(z.string()),
  total: z.number(),
});

export type CategoryTotal = z.infer<typeof CategoryTotalSchema>;
