import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny, z } from "zod";
import { ValidationError } from "../lib/errors.js";

function toIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

/**
 * Memvalidasi request body dengan skema Zod dari `@budget-buddy/shared`.
 * Hasil parse menggantikan `req.body`, jadi controller menerima data yang
 * sudah bertipe dan ternormalisasi.
 */
export function validateBody<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new ValidationError(toIssues(result.error)));
      return;
    }

    req.body = result.data as z.infer<TSchema>;
    next();
  };
}

/** Memvalidasi route params, mis. `:id` harus UUID. */
export function validateParams<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(new ValidationError(toIssues(result.error)));
      return;
    }

    next();
  };
}
