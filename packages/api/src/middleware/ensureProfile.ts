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
    const created = await prisma.user.create({
      data: {
        supabase_id: userId,
        email,
        name: name ?? email.split("@")[0] ?? "Pengguna",
      },
      select: { id: true },
    });

    req.profileId = created.id;
    next();
    return;
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
