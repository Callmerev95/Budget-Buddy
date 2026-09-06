import { Router } from "express";
import { notificationIdSchema, notificationListSchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateParams, validateQuery } from "../middleware/validate.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/", validateQuery(notificationListSchema), asyncHandler(listNotifications));
router.patch("/read-all", asyncHandler(markAllNotificationsRead));
router.patch(
  "/:id/read",
  validateParams(notificationIdSchema),
  asyncHandler(markNotificationRead),
);

export default router;
