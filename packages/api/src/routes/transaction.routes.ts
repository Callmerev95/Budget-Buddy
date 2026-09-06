import { Router } from "express";
import {
  createTransactionSchema,
  createTransferSchema,
  exportQuerySchema,
  transactionIdSchema,
} from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  exportTransactionsCsv,
  getMonthlySummary,
  listTransactions,
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/", asyncHandler(listTransactions));
router.get("/summary", asyncHandler(getMonthlySummary));
router.get(
  "/export",
  validateQuery(exportQuerySchema),
  asyncHandler(exportTransactionsCsv),
);
router.post("/", validateBody(createTransactionSchema), asyncHandler(createTransaction));
router.post(
  "/transfer",
  validateBody(createTransferSchema),
  asyncHandler(createTransfer),
);
router.delete(
  "/:id",
  validateParams(transactionIdSchema),
  asyncHandler(deleteTransaction),
);

export default router;
