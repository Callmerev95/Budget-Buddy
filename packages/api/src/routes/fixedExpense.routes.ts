import { Router } from "express";
import { createFixedExpenseSchema, fixedExpenseIdSchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createFixedExpense,
  deleteFixedExpense,
  listFixedExpenses,
  payFixedExpense,
} from "../controllers/fixedExpense.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listFixedExpenses));
router.post(
  "/",
  validateBody(createFixedExpenseSchema),
  asyncHandler(createFixedExpense),
);
router.post(
  "/:id/pay",
  validateParams(fixedExpenseIdSchema),
  asyncHandler(payFixedExpense),
);
router.delete(
  "/:id",
  validateParams(fixedExpenseIdSchema),
  asyncHandler(deleteFixedExpense),
);

export default router;
