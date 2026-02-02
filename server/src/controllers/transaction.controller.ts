import { Request, Response } from "express"; 
import prisma from "../lib/prisma.js";
import { sendPushNotification } from "./auth.controller.js"; 

export const addLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, category } = req.body;
    const userFromToken = (req as any).user;
    const userId = userFromToken?.id || userFromToken?.userId;

    const newLog = await prisma.dailyLog.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        userId,
      },
    });

    // KIRIM NOTIFIKASI [cite: 2026-01-14]
    if (userId) {
      sendPushNotification(
        userId,
        "Catatan Tersimpan! 💸",
        `Berhasil mencatat ${description} sebesar Rp ${parseFloat(amount).toLocaleString("id-ID")}`,
      );
    }

    res
      .status(201)
      .json({ message: "Catatan berhasil disimpan! 💸", data: newLog });
  } catch (error) {
    console.error("Add Log Error:", error);
    res.status(500).json({ message: "Gagal menyimpan catatan" });
  }
};

export const getLogs = async (req: any, res: Response): Promise<void> => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

/**
 * Controller untuk menangani pembayaran tagihan rutin secara instan.
 */
export const payFixedExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, amount } = req.body;
    const userFromToken = (req as any).user;
    const userId = userFromToken?.id || userFromToken?.userId;

    if (!userId) {
      res.status(401).json({ message: "Sesi habis, silakan login ulang" });
      return;
    }

    // Buat catatan transaksi otomatis agar robot scheduler berhenti menagih bulan ini [cite: 2026-01-14]
    const transaction = await prisma.dailyLog.create({
      data: {
        description: `Pembayaran ${name}`, // Nama harus mengandung nama tagihan agar terdeteksi [cite: 2026-01-14]
        amount: parseFloat(amount),
        category: "Tagihan",
        userId,
      },
    });

    res.status(201).json({
      message: `${name} berhasil dibayar! ✅`,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal memproses pembayaran tagihan" });
  }
};
