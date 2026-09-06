import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama terlalu panjang"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** Konfirmasi hapus akun: email yang diketik harus cocok dengan profil. */
export const deleteAccountSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
