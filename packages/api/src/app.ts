import compression from "compression";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { corsOrigins, env, isProduction } from "./config/env.js";
import { buildCspDirectives } from "./lib/csp.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import cronRoutes from "./routes/cron.routes.js";
import fixedExpenseRoutes from "./routes/fixedExpense.routes.js";
import pushRoutes from "./routes/push.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import userRoutes from "./routes/user.routes.js";

/**
 * Batas laju umum untuk seluruh API.
 *
 * Aplikasi terbuka untuk publik, jadi tanpa ini satu klien bisa menghabiskan
 * kuota database dan egress untuk semua pengguna.
 */
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Terlalu banyak permintaan. Coba lagi sebentar." },
});

function applyCors(app: Express): void {
  // Web dan API berada pada origin yang sama di Vercel, jadi CORS umumnya
  // tidak diperlukan. Allowlist ini hanya untuk pengembangan lokal.
  if (corsOrigins.length === 0) return;

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    }

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });
}

export function buildApp(): Express {
  const app = express();

  // Vercel menaruh function di belakang proxy; rate limit butuh IP asli.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      // CSP dimatikan saat development karena Vite HMR memakai inline
      // script dan WebSocket ke origin dev. Di production CSP ketat aktif.
      contentSecurityPolicy: isProduction
        ? { directives: buildCspDirectives({ supabaseUrl: env.SUPABASE_URL }) }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));

  applyCors(app);

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", apiLimiter);
  app.use("/api/user", userRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/fixed-expenses", fixedExpenseRoutes);
  app.use("/api/push", pushRoutes);
  app.use("/api/cron", cronRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
