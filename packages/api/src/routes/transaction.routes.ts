import { Router } from "express";
import { createTransactionSchema, transactionIdSchema } from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createTransaction,
  deleteTransaction,
  getMonthlySummary,
  listTransactions,
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listTransactions));
router.get("/summary", asyncHandler(getMonthlySummary));
router.post("/", validateBody(createTransactionSchema), asyncHandler(createTransaction));
router.delete(
  "/:id",
  validateParams(transactionIdSchema),
  asyncHandler(deleteTransaction),
);

export default router;
