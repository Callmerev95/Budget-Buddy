import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
