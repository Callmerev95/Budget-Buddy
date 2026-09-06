import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Konfigurasi ini hanya dipakai Prisma CLI (`migrate`, `generate`, `studio`).
 *
 * Runtime tidak membacanya: `PrismaClient` mendapat koneksi dari driver adapter
 * di packages/api/src/lib/prisma.ts, yang memakai DATABASE_URL (Supavisor
 * transaction pooler, port 6543).
 *
 * CLI di sini memakai DIRECT_URL (port 5432) karena migrasi butuh koneksi
 * langsung dan tidak bisa lewat transaction pooler.
 */
const directUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // `generate` tidak menyentuh database, jadi datasource hanya disertakan bila
  // DIRECT_URL tersedia. Tanpa ini, `env()` dari @prisma/config melempar saat
  // config dimuat dan `prisma generate` gagal di lingkungan build yang tidak
  // memegang kredensial database, termasuk Vercel dan CI.
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
});
