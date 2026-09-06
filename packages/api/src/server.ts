import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

/**
 * Entrypoint pengembangan lokal.
 *
 * Di produksi Express dijalankan sebagai Vercel Function lewat `api/index.ts`,
 * yang mengekspor app tanpa memanggil `listen`.
 */
const app = buildApp();

async function main(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(`API siap di http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} diterima, menutup server.`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error: unknown) => {
  console.error("Gagal menjalankan server:", error);
  process.exit(1);
});
