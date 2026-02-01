console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL ? "ADA" : "KOSONG");
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Menggunakan route yang sudah dipisahkan
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("BudgetBuddy API is running... 🚀");
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  console.log("\nPrisma disconnected. Bye-bye! 👋");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("Database connected via Driver Adapter! ✅");
    app.listen(PORT, () => {
      console.log(`Server is sprinting on port ${PORT}`);
    });
  } catch (err) {
    console.error("Gagal nyalain server gara-gara database:", err);
    process.exit(1);
  }
}

bootstrap();
