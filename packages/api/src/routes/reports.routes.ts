import { Router } from "express";
import { monthsQuerySchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateQuery } from "../middleware/validate.js";
import { getMonthlyTrend } from "../controllers/reports.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/monthly", validateQuery(monthsQuerySchema), asyncHandler(getMonthlyTrend));

export default router;
