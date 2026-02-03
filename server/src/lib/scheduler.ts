import cron from "node-cron";
import prisma from "./prisma.js";
import { sendPushNotification } from "../controllers/auth.controller.js";

/**
 * Scheduler Job: Berjalan otomatis setiap hari pukul 08:00 pagi.
 * Bertugas mengecek tagihan rutin (Fixed Expenses) yang jatuh tempo.
 */
cron.schedule("0 8 * * *", async () => {
  const now = new Date();
  const todayDate = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  try {
    // 1. Ambil semua tagihan yang jatuh tempo pada tanggal hari ini
    const dueExpenses = await prisma.fixedExpense.findMany({
      where: { dueDate: todayDate },
      include: { user: true },
    });

    for (const expense of dueExpenses) {
      // 2. Cek riwayat transaksi: Cari apakah tagihan ini sudah dibayar bulan ini
      const alreadyPaid = await prisma.dailyLog.findFirst({
        where: {
          userId: expense.userId,
          // Mencari kecocokan deskripsi (misal: "WiFi" dalam "Pembayaran WiFi")
          description: { contains: expense.name, mode: "insensitive" },
          date: {
            gte: new Date(currentYear, currentMonth, 1), // Mulai dari tanggal 1 bulan ini
          },
        },
      });

      // 3. Hanya kirim notifikasi jika belum ada catatan pembayaran di bulan ini
      if (!alreadyPaid) {
        // Gunakan Format Judul Spesifik agar Unique Tagging di Service Worker bekerja
        await sendPushNotification(
          expense.userId,
          `Tagihan: ${expense.name} 🔔`,
          `Waktunya membayar ${expense.name} sebesar Rp ${expense.amount.toLocaleString("id-ID")}.`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Scheduler Error:", error);
  }
});
