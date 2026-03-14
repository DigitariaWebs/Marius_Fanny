import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.js";
import * as promoController from "../controllers/promo.controller.js";
import {
  createPromoSchema,
  promoIdParamSchema,
  promoListQuerySchema,
  updatePromoSchema,
  validatePromoSchema,
} from "../schemas/promo.schema.js";

const router = Router();

/**
 * Public: validate a promo code against a cart
 * POST /api/promos/validate
 */
router.post(
  "/validate",
  optionalAuth,
  validateBody(validatePromoSchema),
  asyncHandler(promoController.validatePromo),
);

/**
 * Admin: promo CRUD
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  validateQuery(promoListQuerySchema),
  asyncHandler(promoController.listPromos),
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(promoIdParamSchema),
  asyncHandler(promoController.getPromoById),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(createPromoSchema),
  asyncHandler(promoController.createPromo),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(promoIdParamSchema),
  validateBody(updatePromoSchema),
  asyncHandler(promoController.updatePromo),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(promoIdParamSchema),
  asyncHandler(promoController.deletePromo),
);

export default router;

