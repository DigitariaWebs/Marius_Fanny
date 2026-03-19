import { Router } from "express";
import { validateBody } from "../middleware/validation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createProOrderSchema } from "../schemas/proOrder.schema.js";
import { createProOrder, getMyProOrders } from "../controllers/proOrder.controller.js";

const router = Router();

// Pro-only: create a new pro order (stored separately + emailed to admin)
router.post("/", requireAuth, requireRole("pro"), validateBody(createProOrderSchema), createProOrder);

// Pro-only: list my pro orders (history)
router.get("/mine", requireAuth, requireRole("pro"), getMyProOrders);

export default router;

