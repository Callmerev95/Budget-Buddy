import { z } from "zod";

/**
 * Satu sumber untuk kategori transaksi.
 *
 * Sebelumnya kategori tersebar di tiga tempat yang tidak sinkron:
 * daftar string di AddTransactionModal, switch ikon di TransactionList,
 * dan palet berbasis indeks di ReportChart.
 *
 * Sejak Fase 2 kategori tinggal di tabel `Category` dan daftar ini menjadi
 * seed sistem (lihat prisma/seed.ts). Ikon dan warna dibaca client dari API.
 */
export const EXPENSE_CATEGORIES = [
  "Makan & Minum",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan",
  "Lainnya",
] as const;

export const INCOME_CATEGORIES = ["Gaji", "Bonus", "Usaha", "Lainnya"] as const;

export const ExpenseCategorySchema = z.enum(EXPENSE_CATEGORIES);
export const IncomeCategorySchema = z.enum(INCOME_CATEGORIES);

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type IncomeCategory = z.infer<typeof IncomeCategorySchema>;

export const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "Makan & Minum";
export const DEFAULT_INCOME_CATEGORY: IncomeCategory = "Gaji";

/** Kategori yang dipakai saat tagihan tetap dibayar. */
export const BILL_CATEGORY: ExpenseCategory = "Tagihan";
