import express, { Request, Response } from "express"; // Import tipe eksplisit
import cors from "cors";
import * as dotenv from "dotenv";
import compression from "compression"; // 1. Tambah ini buat kompres payload
import helmet from "helmet"; // 2. Tambah ini buat security headers

// Load dotenv paling atas sebelum import file lokal yang pake env
dotenv.config();

// Debug dipindah setelah config biar akurat
console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL ? "ADA" : "KOSONG");

import "./lib/scheduler.js";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import fixedExpenseRoutes from "./routes/fixedExpense.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE STACK
app.use(helmet()); // Proteksi dari celah keamanan umum
app.use(cors());
app.use(compression()); // Kompres data JSON (penting buat data laporan yang gede)
app.use(express.json());

// Menggunakan route yang sudah dipisahkan
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fixed-expenses", fixedExpenseRoutes);

// Strict Typing untuk route utama
app.get("/", (_req: Request, res: Response) => {
  res.send("BudgetBuddy API is running... 🚀");
});

// GHOST ROUTE HANDLER (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log("\nPrisma disconnected. Bye-bye! 👋");
    process.exit(0);
  } catch (err) {
    console.error("Error pas shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function bootstrap() {
  try {
    // Cek koneksi DB dulu sebelum listen
    await prisma.$connect();
    console.log("Database connected via Driver Adapter! ✅");

    app.listen(PORT, () => {
      console.log(`Server is sprinting on port ${PORT} 🏎️🔥`);
    });
  } catch (err) {
    console.error("Gagal nyalain server gara-gara database:", err);
    process.exit(1);
  }
}

bootstrap();
