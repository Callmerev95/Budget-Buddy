import { Router } from "express";
import { compareQuerySchema, monthsQuerySchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateQuery } from "../middleware/validate.js";
import {
  getMonthComparison,
  getMonthlyTrend,
} from "../controllers/reports.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/monthly", validateQuery(monthsQuerySchema), asyncHandler(getMonthlyTrend));
router.get(
  "/compare",
  validateQuery(compareQuerySchema),
  asyncHandler(getMonthComparison),
);

export default router;
