import { z } from "zod";
import type { Request, Response } from "express";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { env, webPushEnabled } from "../config/env.js";

const subscriptionSchema = z.object({
  endpoint: z.string().url("Endpoint subscription tidak valid"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

/**
 * Client butuh VAPID public key untuk mendaftar push subscription.
 *
 * README lama menyuruh menempelkan kunci ini ke dalam Dashboard.tsx secara
 * manual, dan kode tersebut tidak pernah ada. Sekarang server yang menyediakan.
 */
export function getPushConfig(_req: Request, res: Response): void {
  res.status(200).json({
    enabled: webPushEnabled,
    publicKey: webPushEnabled ? env.VAPID_PUBLIC_KEY : null,
  });
}

export async function savePushSubscription(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const subscription = subscriptionSchema.parse(req.body);

  await prisma.user.update({
    where: { id: userId },
    data: { pushSubscription: JSON.stringify(subscription) },
  });

  res.status(200).json({ message: "Notifikasi diaktifkan." });
}

export async function deletePushSubscription(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  await prisma.user.update({
    where: { id: userId },
    data: { pushSubscription: null },
  });

  res.status(200).json({ message: "Notifikasi dimatikan." });
}
