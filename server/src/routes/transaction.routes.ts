import { Router } from "express";
import {
  addLog,
  getLogs,
  deleteLog,
} from "../controllers/transaction.controller.js";
import { authenticateToken } from "../lib/auth.js";

const router = Router();

router.use(authenticateToken); // Semua route di sini wajib login

router.post("/", addLog);
router.get("/", getLogs);
router.delete("/:id", deleteLog);

export default router;
