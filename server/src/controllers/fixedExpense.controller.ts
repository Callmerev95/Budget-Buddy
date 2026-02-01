import { Response } from "express";
import prisma from "../lib/prisma.js";

// Ambil semua daftar pengeluaran tetap user
export const getFixedExpenses = async (req: any, res: Response) => {
  try {
    const expenses = await prisma.fixedExpense.findMany({
      where: { userId: req.user.userId },
      orderBy: { dueDate: "asc" },
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data tagihan" });
  }
};

// Tambah tagihan baru (kosan, wifi, dll)
export const addFixedExpense = async (req: any, res: Response) => {
  try {
    const { name, amount, dueDate } = req.body;
    const newExpense = await prisma.fixedExpense.create({
      data: {
        name,
        amount: Number(amount),
        dueDate: Number(dueDate),
        userId: req.user.userId,
      },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan tagihan" });
  }
};

// Hapus tagihan jika sudah tidak berlangganan
export const deleteFixedExpense = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.fixedExpense.delete({
      where: { id, userId: req.user.userId },
    });
    res.status(200).json({ message: "Tagihan dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus tagihan" });
  }
};
