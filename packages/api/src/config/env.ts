import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/**
 * Memuat `.env` dari root monorepo.
 *
 * `dotenv/config` polos mencari `.env` di process.cwd(), tapi script
 * workspace npm (`npm run dev:api`) berjalan dengan cwd = packages/api,
 * sehingga `.env` tidak pernah ketemu dan validasi selalu gagal. Fungsi ini
 * berjalan naik dari lokasi file ini sampai menemukan `.env`.
 * Di Vercel tidak ada file `.env` — nilai berasal dari platform, dan fungsi
 * ini tidak melakukan apa-apa.
 */
function loadDotEnv(): void {
  // Untuk test hermetik: DOTENV_PATH=none melewatkan pemuatan file,
  // sehingga test mengontrol environment sepenuhnya lewat process.env.
  if (process.env.DOTENV_PATH === "none") return;

  const explicit = process.env.DOTENV_PATH;
  if (explicit) {
    if (fs.existsSync(explicit)) dotenv.config({ path: explicit });
    return;
  }

  let dir = path.dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 6; depth += 1) {
    if (fs.existsSync(path.join(dir, ".env"))) {
      dotenv.config({ path: path.join(dir, ".env") });
      return;
    }

    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

loadDotEnv();

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

  /**
   * Koneksi langsung/session mode untuk Prisma CLI (migrate, studio).
   * Tidak dipakai runtime — runtime lewat DATABASE_URL pooler.
   * Opsional di sini karena Vercel tidak memegang kredensial database;
   * kalau kosong, prisma.config.ts melewatkan datasource dan `migrate`
   * menolak dengan pesan jelas.
   */
  DIRECT_URL: z.string().min(1).optional(),

  SUPABASE_URL: z.string().url("SUPABASE_URL harus berupa URL yang valid"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY wajib diisi"),

  /**
   * Kunci service role untuk operasi admin (hapus auth user di danger zone).
   * Opsional: tanpa ini endpoint hapus akun menolak dengan 503.
   * Tidak pernah dikirim ke client dalam bentuk apa pun.
   */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  /** URL publik aplikasi, dipakai untuk redirect reset password. */
  APP_URL: z.string().url("APP_URL harus berupa URL yang valid"),

  /** Daftar origin yang diizinkan, dipisah koma. Kosong berarti same-origin saja. */
  CORS_ORIGINS: z.string().default(""),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  /** Melindungi endpoint cron dari pemanggilan pihak luar. */
  CRON_SECRET: z.string().min(16, "CRON_SECRET minimal 16 karakter").optional(),

  // Default 5001, bukan 5000: port 5000 dipakai AirPlay Receiver bawaan
  // macOS (menjawab request non-AirPlay dengan 403). Hanya untuk lokal;
  // Vercel menentukan port-nya sendiri.
  PORT: z.coerce.number().int().positive().default(5001),
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
