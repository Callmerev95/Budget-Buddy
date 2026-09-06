import { z } from "zod";
import { AmountSchema, DueDateSchema, NonNegativeAmountSchema } from "../domain/money.js";

export const createFixedExpenseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tagihan wajib diisi")
    .max(80, "Nama terlalu panjang"),
  amount: AmountSchema,
  dueDate: DueDateSchema,
});

export const fixedExpenseIdSchema = z.object({
  id: z.string().uuid("ID tagihan tidak valid"),
});

export const financialPlanSchema = z
  .object({
    monthlyIncome: NonNegativeAmountSchema,
    savingsTarget: NonNegativeAmountSchema,
    isPercentTarget: z.boolean(),
  })
  .refine((plan) => !plan.isPercentTarget || plan.savingsTarget <= 100, {
    message: "Target tabungan dalam persen tidak boleh lebih dari 100",
    path: ["savingsTarget"],
  });

export type CreateFixedExpenseInput = z.infer<typeof createFixedExpenseSchema>;
export type FinancialPlanInput = z.infer<typeof financialPlanSchema>;
