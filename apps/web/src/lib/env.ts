import { z } from "zod";

/**
 * Validasi environment client saat boot.
 *
 * Base URL API tidak lagi di-hardcode ke domain produksi seperti versi lama;
 * web dan API berbagi origin, jadi path relatif sudah cukup.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL harus berupa URL yang valid"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY wajib diisi"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Konfigurasi environment tidak valid:\n${details}`);
}

export const env = parsed.data;

/** Same-origin: Vercel meneruskan /api/* ke Vercel Function. */
export const API_BASE_URL = "/api";
