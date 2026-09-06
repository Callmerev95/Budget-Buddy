import { prisma } from "./prisma.js";
import { AppError } from "./errors.js";

/**
 * Resolusi referensi untuk kontrak lama yang masih memakai nama.
 *
 * Client lama mengirim nama kategori ("Makan & Minum") dan tidak mengenal
 * akun. Server menerjemahkannya ke ID: akun default "Cash" (dibuat otomatis
 * bila belum ada) dan kategori sistem atau milik pengguna.
 * Client baru (Fase 4) mengirim ID langsung dan melewati fungsi ini.
 */

/** Akun default pengguna, dibuat otomatis ("Cash") bila belum ada. */
export async function ensureDefaultAccount(userId: string): Promise<string> {
  const existing = await prisma.account.findFirst({
    where: { userId, isArchived: false },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (existing) return existing.id;

  const created = await prisma.account.create({
    data: { userId, name: "Cash", type: "CASH" },
    select: { id: true },
  });

  return created.id;
}

/**
 * ID kategori dari namanya. Kategori milik pengguna didahulukan,
 * lalu kategori sistem. Jatuh kembali ke "Lainnya" sejenis bila nama
 * tidak dikenal (mis. data lama).
 */
export async function resolveCategoryId(
  userId: string,
  name: string,
  kind: "INCOME" | "EXPENSE" = "EXPENSE",
): Promise<string> {
  const owned = await prisma.category.findFirst({
    where: { userId, name, kind, isArchived: false },
    select: { id: true },
  });

  if (owned) return owned.id;

  const systemic = await prisma.category.findFirst({
    where: { userId: null, name, kind },
    select: { id: true },
  });

  if (systemic) return systemic.id;

  const fallback = await prisma.category.findFirst({
    where: { userId: null, name: "Lainnya", kind },
    select: { id: true },
  });

  if (!fallback) {
    throw new AppError(500, "Kategori sistem belum di-seed.", "seed_missing");
  }

  return fallback.id;
}
