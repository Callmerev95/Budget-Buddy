import "dotenv/config";
import { z } from "zod";

/**
 * Validasi environment saat boot.
 *
 * Sebelumnya `process.env.X!` dan fallback hardcoded tersebar di beberapa file,
 * termasuk fallback JWT secret di repo publik. Sekarang server menolak start
 * ketika konfigurasi tidak lengkap, bukan gagal diam-diam saat request masuk.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),

  SUPABASE_URL: z.string().url("SUPABASE_URL harus berupa URL yang valid"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY wajib diisi"),

  /** URL publik aplikasi, dipakai untuk redirect reset password. */
  APP_URL: z.string().url("APP_URL harus berupa URL yang valid"),

  /** Daftar origin yang diizinkan, dipisah koma. Kosong berarti same-origin saja. */
  CORS_ORIGINS: z.string().default(""),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  /** Melindungi endpoint cron dari pemanggilan pihak luar. */
  CRON_SECRET: z.string().min(16, "CRON_SECRET minimal 16 karakter").optional(),

  PORT: z.coerce.number().int().positive().default(5000),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Konfigurasi environment tidak valid:\n${details}`);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";

/** Web push hanya aktif ketika ketiga kunci VAPID tersedia. */
export const webPushEnabled = Boolean(
  env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT,
);

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
