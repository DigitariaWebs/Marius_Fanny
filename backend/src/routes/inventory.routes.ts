import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validation.js";
import {
  inventoryQuerySchema,
} from "../schemas/inventory.schema.js";
import {
  getInventory,
} from "../controllers/inventory.controller.js";

const router = Router();

// View current inventory (authenticated staff/admin).
router.get("/", requireAuth, validateQuery(inventoryQuerySchema), getInventory);

export default router;
