import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { runDailyReminders } from "../controllers/cron.controller.js";

const router = Router();

router.get("/daily", asyncHandler(runDailyReminders));

export default router;
