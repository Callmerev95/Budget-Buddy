import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { registerSchema } from "../../../shared/src/schemas/auth.schema.js";

export const register = async (req: Request, res: Response) => {
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
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email atau password salah, bro!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email atau password salah, bro!" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret_budget_buddy_123",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login berhasil! 🔑",
      token,
      // Sertakan dailyLimit saat login agar frontend langsung sinkron [cite: 2026-01-14]
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dailyLimit: user.dailyLimit,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      // Menambahkan dailyLimit ke dalam select agar dikirim ke frontend [cite: 2026-01-14]
      select: {
        id: true,
        name: true,
        email: true,
        dailyLimit: true,
        monthlyIncome: true,
        savingsTarget: true,
        isPercentTarget: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan, bro!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLimit = async (req: any, res: Response) => {
  try {
    const { dailyLimit } = req.body;
    // Update data berdasarkan userId dari token
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { dailyLimit: parseFloat(dailyLimit) },
    });

    res.status(200).json({
      message: "Limit harian diperbarui! 🎯",
      dailyLimit: updatedUser.dailyLimit,
    });
  } catch (error) {
    console.error("Update Limit Error:", error);
    res.status(500).json({ message: "Gagal update limit" });
  }
};

export const updateFinancialPlan = async (req: any, res: Response) => {
  try {
    const { monthlyIncome, savingsTarget, isPercentTarget, dailyLimit } =
      req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        monthlyIncome: parseFloat(monthlyIncome),
        savingsTarget: parseFloat(savingsTarget),
        isPercentTarget: Boolean(isPercentTarget),
        dailyLimit: parseFloat(dailyLimit), // Hasil hitung dari frontend disimpan di sini
      },
    });

    res.status(200).json({
      message: "Rencana keuangan diperbarui! 💰",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Plan Error:", error);
    res.status(500).json({ message: "Gagal update rencana keuangan" });
  }
};
