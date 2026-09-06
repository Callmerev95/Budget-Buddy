import { prisma } from "./prisma.js";
import type { NotificationType } from "../../generated/prisma/client.js";

/**
 * Mencatat notifikasi in-app. Dipanggil berdampingan dengan push (yang
 * bersifat fire-and-forget) di setiap jalur yang menghasilkan peristiwa
 * penting pengguna: pengingat tagihan, konfirmasi bayar, tanda terima
 * transaksi.
 *
 * Kegagalan pencatatan tidak boleh menggagalkan request utama — sama
 * seperti push, error hanya dicatat.
 */
export async function recordNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
): Promise<void> {
  try {
    await prisma.notification.create({ data: { userId, type, title, body } });
  } catch (error) {
    console.error("Gagal mencatat notifikasi:", error);
  }
}
