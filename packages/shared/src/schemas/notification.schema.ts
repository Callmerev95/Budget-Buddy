import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "BILL_DUE",
  "PAYMENT_RECEIVED",
  "TRANSACTION_RECORDED",
]);

export const notificationListSchema = z.object({
  unreadOnly: z
    .union([z.string(), z.boolean()])
    .transform((value) => value === true || value === "true")
    .optional(),
  cursor: z.string().uuid("Cursor tidak valid").optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().uuid("ID notifikasi tidak valid"),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;
