import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env, isProduction } from "../config/env.js";

/**
 * Satu instance Prisma per proses.
 *
 * Di serverless, modul bisa dievaluasi ulang saat hot reload maupun antar
 * invocation pada instance yang sama. Menyimpannya di globalThis mencegah
 * pembuatan pool koneksi berulang yang menghabiskan kuota database.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
