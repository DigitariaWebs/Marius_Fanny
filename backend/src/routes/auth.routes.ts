import { Router } from "express";
import { forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = Router();

// L'URL sera /api/auth/forgot_password
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);

export default router;