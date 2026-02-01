import { z } from "zod";

/** AUTH SCHEMAS */
export const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi!"),
});

/** TRANSACTION SCHEMAS */
export const CategoryEnum = z.enum([
  "makan",
  "minum",
  "transportasi",
  "hiburan",
  "lainnya",
]);

export const DailyLogSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  category: CategoryEnum,
});

/** EXPORT TYPES (Inferred from Schemas) */
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type DailyLogInput = z.infer<typeof DailyLogSchema>;
export type LogCategory = z.infer<typeof CategoryEnum>;
