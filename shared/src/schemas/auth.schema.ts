import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Format email nggak valid nih bro"),
  password: z.string().min(6, "Password minimal 6 karakter ya"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email salah"),
  password: z.string().min(1, "Password harus diisi"),
});

// Jenis tipe data untuk dipakai di Frontend nanti
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
