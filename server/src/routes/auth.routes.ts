import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateLimit,
  updateFinancialPlan,
  subscribe,
  forgotPassword,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../lib/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", authenticateToken, getMe);
router.patch("/limit", authenticateToken, updateLimit);
router.patch("/financial-plan", authenticateToken, updateFinancialPlan);
router.post("/subscribe", authenticateToken, subscribe);

export default router;
