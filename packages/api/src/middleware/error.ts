import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";
import { AppError, ValidationError } from "../lib/errors.js";

/** Route yang tidak dikenal, dipasang setelah semua router. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
}

/**
 * Satu tempat penerjemahan error ke response.
 *
 * Sebelumnya tidak ada error handler global, sehingga handler bawaan Express
 * berpotensi membocorkan stack trace ke client di produksi.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      issues: error.issues,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message, code: error.code });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Data yang dikirim tidak valid.",
      code: "validation_error",
      issues: error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    message: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    code: "internal_error",
    ...(isProduction
      ? {}
      : { detail: error instanceof Error ? error.message : String(error) }),
  });
}
