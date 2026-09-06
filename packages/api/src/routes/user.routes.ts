import { Router } from "express";
import { financialPlanSchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { getMe, updateFinancialPlan } from "../controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/me", asyncHandler(getMe));
router.patch(
  "/financial-plan",
  validateBody(financialPlanSchema),
  asyncHandler(updateFinancialPlan),
);

export default router;
