import { Router } from "express";
import { addLog, getLogs } from "../controllers/transaction.controller.js";
import { authenticateToken } from "../lib/auth.js";

const router = Router();

router.use(authenticateToken); // Semua route di sini wajib login

router.post("/", addLog);
router.get("/", getLogs);

export default router;
