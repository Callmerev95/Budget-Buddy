import { Router } from "express";
import {
  addGoalProgressSchema,
  createAccountSchema,
  createBudgetSchema,
  createCategorySchema,
  createGoalSchema,
  idParamSchema,
  monthQuerySchema,
} from "@budget-buddy/shared";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureProfile } from "../middleware/ensureProfile.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  addGoalProgress,
  createAccount,
  createBudget,
  createCategory,
  createGoal,
  deleteAccount,
  deleteBudget,
  deleteGoal,
  listAccounts,
  listBudgets,
  listCategories,
  listGoals,
} from "../controllers/catalog.controller.js";

const router = Router();

router.use(requireAuth, ensureProfile);

router.get("/accounts", asyncHandler(listAccounts));
router.post("/accounts", validateBody(createAccountSchema), asyncHandler(createAccount));
router.delete(
  "/accounts/:id",
  validateParams(idParamSchema),
  asyncHandler(deleteAccount),
);

router.get("/categories", asyncHandler(listCategories));
router.post(
  "/categories",
  validateBody(createCategorySchema),
  asyncHandler(createCategory),
);

router.get("/budgets", validateQuery(monthQuerySchema), asyncHandler(listBudgets));
router.post("/budgets", validateBody(createBudgetSchema), asyncHandler(createBudget));
router.delete("/budgets/:id", validateParams(idParamSchema), asyncHandler(deleteBudget));

router.get("/goals", asyncHandler(listGoals));
router.post("/goals", validateBody(createGoalSchema), asyncHandler(createGoal));
router.patch(
  "/goals/:id/progress",
  validateParams(idParamSchema),
  validateBody(addGoalProgressSchema),
  asyncHandler(addGoalProgress),
);
router.delete("/goals/:id", validateParams(idParamSchema), asyncHandler(deleteGoal));

export default router;
