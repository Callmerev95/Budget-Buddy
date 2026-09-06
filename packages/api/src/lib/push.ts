import { prisma } from "./prisma.js";
import { webPushEnabled, webpush } from "./webpush.js";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Pengiriman push notification.
 *
 * Dipisahkan dari controller auth karena sebelumnya scheduler dan controller
 * transaksi mengimpor fungsi ini dari `auth.controller`, menciptakan
 * ketergantungan melingkar antar modul.
 *
 * Kegagalan pengiriman tidak boleh menggagalkan request utama, jadi error
 * hanya dicatat.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!webPushEnabled) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;

    const subscription = JSON.parse(user.pushSubscription) as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/",
      }),
    );
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    // 404/410 berarti subscription sudah mati di sisi push service.
    if (statusCode === 404 || statusCode === 410) {
      await prisma.user
        .update({ where: { id: userId }, data: { pushSubscription: null } })
        .catch(() => undefined);
      return;
    }

    console.error("Gagal mengirim push notification:", error);
  }
}
