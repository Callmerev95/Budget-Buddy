import { z } from "zod";
import { ExpenseCategorySchema, IncomeCategorySchema } from "../domain/category.js";
import { AmountSchema } from "../domain/money.js";

const uuidSchema = z.string().uuid("ID tidak valid");

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(120, "Deskripsi terlalu panjang"),
  amount: AmountSchema,
  category: ExpenseCategorySchema.or(IncomeCategorySchema),
  type: transactionTypeSchema.default("EXPENSE"),
  // Opsional selama client lama masih mengirim nama kategori. Client baru
  // (Fase 4) mengirim ID langsung; server memakai ID bila ada.
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
});

export const transactionIdSchema = z.object({
  id: z.string().uuid("ID transaksi tidak valid"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
