import { z } from "zod";
import { ExpenseCategorySchema } from "../domain/category.js";
import { AmountSchema } from "../domain/money.js";

export const createTransactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(120, "Deskripsi terlalu panjang"),
  amount: AmountSchema,
  category: ExpenseCategorySchema,
});

export const transactionIdSchema = z.object({
  id: z.string().uuid("ID transaksi tidak valid"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
