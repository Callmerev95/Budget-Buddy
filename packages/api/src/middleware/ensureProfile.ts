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

  const existing = await prisma.user.findUnique({
    where: { supabase_id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!existing) {
    const displayName = name ?? email.split("@")[0] ?? "Pengguna";

    try {
      const created = await prisma.user.create({
        data: { supabase_id: userId, email, name: displayName },
        select: { id: true },
      });

      req.profileId = created.id;
      next();
      return;
    } catch (error) {
      // Email sudah dipakai baris lain: pengguna mendaftar ulang setelah
      // akun auth-nya dihapus (Supabase tidak meng-cascade penghapusan ke
      // tabel kita), sehingga profil orphan tertinggal. Adopsi baris itu
      // alih-alih gagal — manusia yang sama, identitas auth baru.
      // P2002 = unique constraint violation.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        const orphan = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (orphan) {
          await prisma.user.update({
            where: { id: orphan.id },
            data: { supabase_id: userId, name: displayName },
          });

          req.profileId = orphan.id;
          next();
          return;
        }
      }

      throw error;
    }
  }

  const displayName = name ?? existing.name;

  if (existing.email !== email || existing.name !== displayName) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, name: displayName },
    });
  }

  req.profileId = existing.id;
  next();
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
