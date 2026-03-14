import { z } from "zod";

export const promoIdParamSchema = z.object({
  id: z.string().min(1),
});

export const promoCodeSchema = z
  .string()
  .min(2, "Le code promo doit contenir au moins 2 caractères")
  .max(32, "Le code promo ne peut pas dépasser 32 caractères")
  .regex(/^[A-Z0-9][A-Z0-9_-]*$/i, "Format de code promo invalide");

export const createPromoSchema = z.object({
  code: promoCodeSchema,
  description: z.string().max(200).optional(),
  discountPercent: z
    .number()
    .min(0, "Le pourcentage doit être >= 0")
    .max(100, "Le pourcentage doit être <= 100"),
  appliesToProductIds: z.array(z.number().int().nonnegative()).optional(),
  minSubtotal: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  usageLimit: z.number().int().nonnegative().optional(),
  usageLimitPerUser: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updatePromoSchema = createPromoSchema.partial().omit({ code: true }).extend({
  code: promoCodeSchema.optional(),
});

export const promoListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  includeInactive: z.coerce.boolean().optional().default(false),
  includeDeleted: z.coerce.boolean().optional().default(false),
  q: z.string().optional(),
});

export const validatePromoSchema = z.object({
  code: promoCodeSchema,
  items: z
    .array(
      z.object({
        productId: z.number().int().nonnegative(),
        amount: z.number().nonnegative(),
      }),
    )
    .min(1),
  subtotal: z.number().nonnegative().optional(),
  email: z.string().email().optional(),
});

export type CreatePromoInput = z.infer<typeof createPromoSchema>;
export type UpdatePromoInput = z.infer<typeof updatePromoSchema>;
export type PromoListQuery = z.infer<typeof promoListQuerySchema>;
export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;

