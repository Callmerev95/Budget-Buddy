import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type CategoryKind,
} from "../packages/api/generated/prisma/client.js";

interface SeedCategory {
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
}

/**
 * Kategori sistem (userId null). Ikon memakai nama Lucide, warna hex —
 * keduanya dibaca client Fase 4 dari API, menggantikan tiga representasi
 * kategori yang tak sinkron di versi lama (emoji di modal, switch di
 * TransactionList, palet indeks di ReportChart).
 */
const SYSTEM_CATEGORIES: SeedCategory[] = [
  // EXPENSE — ikon dan warna mengikuti pemetaan client lama.
  { name: "Makan & Minum", kind: "EXPENSE", icon: "utensils", color: "#f97316" },
  { name: "Transportasi", kind: "EXPENSE", icon: "car", color: "#3b82f6" },
  { name: "Belanja", kind: "EXPENSE", icon: "shopping-bag", color: "#a855f7" },
  { name: "Hiburan", kind: "EXPENSE", icon: "gamepad-2", color: "#ec4899" },
  { name: "Tagihan", kind: "EXPENSE", icon: "receipt", color: "#f59e0b" },
  { name: "Lainnya", kind: "EXPENSE", icon: "shapes", color: "#6b7280" },
  // INCOME
  { name: "Gaji", kind: "INCOME", icon: "briefcase", color: "#10b981" },
  { name: "Bonus", kind: "INCOME", icon: "gift", color: "#14b8a6" },
  { name: "Usaha", kind: "INCOME", icon: "store", color: "#6366f1" },
  { name: "Lainnya", kind: "INCOME", icon: "shapes", color: "#6b7280" },
];

async function main(): Promise<void> {
  // Seed menulis data: pakai koneksi langsung bila ada, pooler bila tidak.
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DIRECT_URL atau DATABASE_URL wajib diisi untuk seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    let created = 0;
    let skipped = 0;

    for (const category of SYSTEM_CATEGORIES) {
      const existing = await prisma.category.findFirst({
        where: { userId: null, name: category.name, kind: category.kind },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await prisma.category.create({ data: { ...category, userId: null } });
      created += 1;
    }

    console.log(`Seed kategori sistem: ${created} dibuat, ${skipped} sudah ada.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Seed gagal:", error);
  process.exit(1);
});
