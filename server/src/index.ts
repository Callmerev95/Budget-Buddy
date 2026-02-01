console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL ? "ADA" : "KOSONG");
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <-- Tambahkan ini
// Import schema dari shared folder
import { registerSchema } from "../../shared/src/schemas/auth.schema.js";
import prisma from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Register (Tetap seperti kode kamu)
app.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah dipakai, bro!" });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
    });

    return res.status(201).json({
      message: "User berhasil terdaftar! 🚀",
      userId: newUser.id,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --- BAGIAN BARU: API LOGIN ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email atau password salah, bro!" });
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email atau password salah, bro!" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret_budget_buddy_123",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login berhasil! 🔑",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// --- END OF LOGIN API ---

app.get("/", (_req, res) => {
  res.send("BudgetBuddy API is running... 🚀");
});

// Penanganan Graceful Shutdown (Tetap seperti kode kamu)
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
