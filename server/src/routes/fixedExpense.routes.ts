import { Router } from "express";
import {
  getFixedExpenses,
  addFixedExpense,
  deleteFixedExpense,
} from "../controllers/fixedExpense.controller.js";
import { authenticateToken } from "../lib/auth.js";

const router = Router();

router.use(authenticateToken); // Semua route di sini butuh login
router.get("/", getFixedExpenses);
router.post("/", addFixedExpense);
router.delete("/:id", deleteFixedExpense);

export default router;
