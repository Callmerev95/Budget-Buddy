import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getAuth } from "./auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      profileId?: string;
    }
  }
}

/**
 * Menjamin baris profil ada untuk setiap identitas terautentikasi.
 *
 * Auth (Supabase) dan data (Postgres) adalah dua sistem terpisah. Pengguna
 * yang baru mendaftar punya token valid tapi belum punya baris `User`,
 * sehingga semua query ter-scope FK (transaksi, tagihan) akan gagal.
 * Middleware ini menutup celah itu: request terautentikasi pertama membuat
 * profil, request berikutnya hanya membaca.
 *
 * Profil dicari by `supabase_id`, bukan primary key — translasi uid ke
 * profile id terjadi di sini, tepat satu tempat.
 */
export async function ensureProfile(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const { userId, email, name } = getAuth(req);

  try {
    req.profileId = await resolveProfileId({ userId, email, name });
    next();
  } catch (error) {
    next(error);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

interface ResolveProfileInput {
  userId: string;
  email: string;
  name: string | null;
}

/**
 * Ambil/ciptakan profile id untuk identitas Supabase, tahan terhadap
 * konversi request: banyak request pertama dari pengguna baru dapat tiba
 * bersamaan sehingga `create` bisa gagal `P2002` yang bukan kita.
 *
 * - Nilai kembalian `Request` melewati jalan pintas read-only bila baris
 *   sudah ada (refresh email/nama bila berubah).
 * - Bila `create` konflik, cukup query ulang: baris mungkin baru saja
 *   dibuat oleh request paralel (race) atau tertinggal sebagai orphan
 *   dengan email sama (akun dihapus hanya di sisi auth).
 */
async function resolveProfileId({
  userId,
  email,
  name,
}: ResolveProfileInput): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { supabase_id: userId },
    select: { id: true, email: true, name: true },
  });

  if (existing) {
    const displayName = name ?? existing.name;
    if (existing.email !== email || existing.name !== displayName) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { email, name: displayName },
      });
    }
    return existing.id;
  }

  const displayName = name ?? email.split("@")[0] ?? "Pengguna";

  try {
    const created = await prisma.user.create({
      data: { supabase_id: userId, email, name: displayName },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    // 1) Race: request paralel pemilik identitas yang sama baru saja membuat
    //    baris. Query ulang by `supabase_id` cukup — nilai sudah benar.
    const bySupabaseId = await prisma.user.findUnique({
      where: { supabase_id: userId },
      select: { id: true },
    });
    if (bySupabaseId) return bySupabaseId.id;

    // 2) Orphan: baris lama ber-email sama tapi `supabase_id` usang (akun
    //    auth dihapus tanpa cascade). Klaim ulang, jangan duplikat.
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!byEmail) throw error;

    await prisma.user.update({
      where: { id: byEmail.id },
      data: { supabase_id: userId, name: displayName },
    });
    return byEmail.id;
  }
}

/**
 * Mengambil profile id untuk scoping query.
 * Melempar bila dipakai pada route yang belum melewati `ensureProfile`.
 */
export function getProfileId(req: Request): string {
  if (!req.profileId) {
    throw new Error("getProfileId dipanggil tanpa ensureProfile pada route ini");
  }

  return req.profileId;
}
