import { z } from "zod";

const uuidSchema = z.string().uuid("ID tidak valid");

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Nama akun wajib diisi").max(60, "Nama terlalu panjang"),
  type: z.enum(["CASH", "BANK", "EWALLET"]),
  initialBalance: z.number().int().min(0, "Saldo awal tidak boleh negatif").default(0),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(60, "Nama terlalu panjang"),
  kind: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().trim().max(40).default("shapes"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus hex seperti #f97316")
    .default("#6b7280"),
});

export const createBudgetSchema = z.object({
  categoryId: uuidSchema,
  periodStart: z.string().datetime({ message: "Awal periode tidak valid" }),
  periodEnd: z.string().datetime({ message: "Akhir periode tidak valid" }),
  amount: z.number().int().positive("Nominal harus lebih dari 0"),
});

export const createGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama target wajib diisi")
    .max(80, "Nama terlalu panjang"),
  target: z.number().int().positive("Target harus lebih dari 0"),
  targetDate: z.string().datetime({ message: "Tanggal target tidak valid" }).optional(),
  accountId: uuidSchema.optional(),
});

export const addGoalProgressSchema = z.object({
  amount: z.number().int().positive("Nominal harus lebih dari 0"),
});

export const idParamSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

export const monthQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM")
    .optional(),
});

export const monthsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
