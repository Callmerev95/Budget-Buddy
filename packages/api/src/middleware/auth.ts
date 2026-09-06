import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";

/**
 * Identitas hasil verifikasi token Supabase.
 * Menggantikan `req.user` bertipe `any` di controller lama.
 */
export interface AuthContext {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const issuer = `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1`;

/**
 * JWKS di-cache oleh `jose`, jadi tidak ada network call per request.
 * Verifikasi lokal memakai kunci publik asymmetric milik project Supabase.
 */
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: "Sesi tidak ditemukan. Silakan masuk kembali." });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: "authenticated",
    });

    const userId = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : null;

    if (!userId || !email) {
      res.status(401).json({ message: "Token tidak memuat identitas yang lengkap." });
      return;
    }

    req.auth = { userId, email };
    next();
  } catch {
    res.status(401).json({ message: "Sesi sudah berakhir. Silakan masuk kembali." });
  }
}

/**
 * Mengambil identitas terverifikasi.
 * Melempar bila dipakai pada route yang belum melewati `requireAuth`,
 * sehingga kesalahan pemasangan middleware terlihat saat pengembangan.
 */
export function getAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw new Error("getAuth dipanggil tanpa requireAuth pada route ini");
  }

  return req.auth;
}
