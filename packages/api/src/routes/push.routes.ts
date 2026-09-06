import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import {
  deletePushSubscription,
  getPushConfig,
  savePushSubscription,
} from "../controllers/push.controller.js";

const router = Router();

// Public: client butuh VAPID public key sebelum mendaftarkan subscription.
router.get("/config", getPushConfig);

router.post(
  "/subscription",
  requireAuth,
  ensureProfile,
  asyncHandler(savePushSubscription),
);
router.delete(
  "/subscription",
  requireAuth,
  ensureProfile,
  asyncHandler(deletePushSubscription),
);

export default router;
