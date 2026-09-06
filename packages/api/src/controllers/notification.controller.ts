import type { Request, Response } from "express";
import { notificationIdSchema, notificationListSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

/**
 * Pusat notifikasi in-app (gaya notification center Fundex, berisi hanya
 * tipe milik aplikasi): pengingat tagihan, konfirmasi bayar, dan tanda
 * terima transaksi. Push tetap berjalan berdampingan.
 */
export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const query = notificationListSchema.parse(req.query);

  const pageSize = Math.min(Math.max(query.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const rows = await prisma.notification.findMany({
    where: { userId, ...(query.unreadOnly ? { readAt: null } : {}) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > pageSize;
  const data = hasMore ? rows.slice(0, pageSize) : rows;

  const unreadCount = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  res.status(200).json({
    data,
    unreadCount,
    nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
  });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { id } = notificationIdSchema.parse(req.params);

  await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });

  res.status(200).json({ message: "Notifikasi ditandai dibaca." });
}

export async function markAllNotificationsRead(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = getProfileId(req);

  const updated = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  res.status(200).json({
    message: `${updated.count} notifikasi ditandai dibaca.`,
    count: updated.count,
  });
}
