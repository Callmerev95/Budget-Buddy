import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { env, isProduction } from "../config/env.js";
import { AppError } from "./errors.js";
import { isScopedQuery } from "./tenancy.js";

/**
 * Guard tenancy: menolak query model user-owned yang tidak menyebut userId.
 *
 * Prisma connect sebagai owner dan melewati RLS, jadi RLS tidak bisa
 * diandalkan mencegah kebocoran antar-pengguna. Guard ini adalah lapis
 * strukturalnya: lupa scoping menjadi error 500 yang ketahuan saat
 * pengembangan, bukan kebocoran data di produksi.
 */
const tenancyGuard = Prisma.defineExtension({
  name: "tenancy-guard",
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        if (!isScopedQuery(model, operation, args)) {
          throw new AppError(
            500,
            `Query ${model}.${operation} tanpa scoping userId ditolak.`,
            "unscoped_query",
          );
        }

        return query(args);
      },
    },
  },
});

/**
 * Satu instance Prisma per proses, di-cache di globalThis agar invocation
 * hangat serverless memakai ulang pool koneksi yang sama.
 */
const globalForPrisma = globalThis as unknown as {
  base?: PrismaClient;
};

function createBaseClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });
}

function baseClient(): PrismaClient {
  globalForPrisma.base ??= createBaseClient();
  return globalForPrisma.base;
}

/**
 * Client tanpa guard, hanya untuk pekerjaan sistem: cron, seed, dan
 * skrip internal. Tidak pernah dipakai di request handler.
 */
export const prismaSystem: PrismaClient = baseClient();

/** Client ter-guard untuk semua request handler. */
export const prisma = prismaSystem.$extends(tenancyGuard);
