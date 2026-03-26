import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = Router();

// Public - get settings
router.get("/", asyncHandler(getSettings));

// Admin only - update settings
router.put("/", requireAuth, requireRole("admin"), asyncHandler(updateSettings));

export default router;
