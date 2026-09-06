import { Router } from "express";
import { occurrenceIdSchema, occurrenceMonthSchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateParams, validateQuery } from "../middleware/validate.js";
import {
  listOccurrences,
  payOccurrence,
  skipOccurrence,
} from "../controllers/recurring.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/", validateQuery(occurrenceMonthSchema), asyncHandler(listOccurrences));
router.post("/:id/pay", validateParams(occurrenceIdSchema), asyncHandler(payOccurrence));
router.post(
  "/:id/skip",
  validateParams(occurrenceIdSchema),
  asyncHandler(skipOccurrence),
);

export default router;
