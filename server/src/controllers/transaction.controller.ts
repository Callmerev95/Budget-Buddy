import { Response } from "express"; // Hapus Request dari sini
import prisma from "../lib/prisma.js";

export const addLog = async (req: any, res: Response): Promise<void> => {
  try {
    const { description, amount, category } = req.body;
    const userId = req.user.userId;

    const newLog = await prisma.dailyLog.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        userId,
      },
    });

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
