import { z } from "zod";

/**
 * Satu sumber untuk kategori transaksi.
 *
 * Sebelumnya kategori tersebar di tiga tempat yang tidak sinkron:
 * daftar string di AddTransactionModal, switch ikon di TransactionList,
 * dan palet berbasis indeks di ReportChart.
 *
 * Pada Fase 2 kategori pindah ke tabel `Category` di database dan modul ini
 * menjadi seed default-nya.
 */
export const EXPENSE_CATEGORIES = [
  "Makan & Minum",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan",
  "Lainnya",
] as const;

export const ExpenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "Makan & Minum";

/** Kategori yang dipakai saat tagihan tetap dibayar. */
export const BILL_CATEGORY: ExpenseCategory = "Tagihan";
