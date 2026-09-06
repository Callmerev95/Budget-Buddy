import type { RequestHandler } from "express";

/**
 * Membungkus handler async agar promise yang reject diteruskan ke
 * error handler Express, bukan menjadi unhandled rejection.
 *
 * Express 4 tidak menangkap error dari handler async secara otomatis.
 */
export function asyncHandler<
  THandler extends (...args: Parameters<RequestHandler>) => Promise<unknown>,
>(handler: THandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
