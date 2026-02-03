import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { registerSchema } from "@shared/schemas/auth.schema.js";
import webpush from "../lib/webpush.js";
import { supabase } from "../lib/supabase.js";

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.",
      });
    }

    const { data: sbData, error: sbError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: { full_name: validatedData.name },
      },
    });

    if (sbError) {
      return res.status(400).json({ message: sbError.message });
    }

    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        supabase_id: sbData.user?.id,
      },
    });

    return res.status(201).json({
      message:
        "Registrasi berhasil. Silakan periksa inbox email Anda untuk melakukan verifikasi akun.",
      userId: newUser.id,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return res.status(400).json({ errors: (error as any).errors });
    }
    console.error("Register Error:", error);
    return res.status(500).json({
      message:
        "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { error: sbError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sbError) {
      // Satpam profesional: membedakan error verifikasi dengan kredensial salah [cite: 2026-02-03]
      if (sbError.message.includes("Email not confirmed")) {
        return res.status(401).json({
          message:
            "Akun Anda belum terverifikasi. Silakan periksa email Anda untuk mengaktifkan akun.",
        });
      }
      return res.status(401).json({
        message:
          "Email atau kata sandi yang Anda masukkan salah. Silakan coba lagi.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Data pengguna tidak ditemukan." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret_budget_buddy_123",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Selamat datang kembali! Anda berhasil masuk.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dailyLimit: user.dailyLimit,
      },
    });
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan sistem saat mencoba masuk." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Panggil Supabase untuk kirim email reset password [cite: 2026-02-03]
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password", // Sesuaikan URL frontend lu [cite: 2026-02-03]
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message:
        "Instruksi pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa inbox Anda.",
    });
  } catch (error: unknown) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan sistem saat memproses permintaan Anda.",
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },

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

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscription = req.body;

    // Debug dulu bro buat mastiin isi req.user apa [cite: 2026-01-14]
    console.log("Debug User Auth:", (req as any).user);

    // Ambil ID dengan lebih aman
    const userFromToken = (req as any).user;
    const userId =
      userFromToken?.id || userFromToken?.userId || userFromToken?.sub;

    // Jika userId tetap tidak ada, stop di sini daripada Prisma error
    if (!userId) {
      res.status(401).json({ message: "User ID tidak ditemukan dalam token" });
      return;
    }

    await prisma.user.update({
      where: { id: userId }, // Sekarang ID tidak akan undefined lagi [cite: 2026-01-14]
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    });

    res.status(200).json({ message: "Subscription berhasil disimpan!" });
  } catch (error) {
    console.error("Error at subscribe controller:", error);
    res.status(500).json({ message: "Gagal menyimpan subscription" });
  }
};

export const sendPushNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;

    const subscription = JSON.parse(user.pushSubscription);

    const payload = JSON.stringify({
      title: title,
      body: message,
      icon: "/icon-192x192.png", // Sesuaikan dengan icon di folder public client
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`✅ Notif terkirim ke user: ${userId}`);
  } catch (error) {
    console.error("❌ Gagal kirim push notif:", error);
  }
};
