import { z } from "zod";

const locationSchema = z.enum(["Montreal", "Laval"]);

export const inventoryQuerySchema = z.object({
  location: locationSchema.optional(),
});

export const inventoryAdjustSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1).optional(),
  location: locationSchema,
  delta: z.number().int(),
});

export const productionStatusSchema = z.object({
  productionItemId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  done: z.boolean(),
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  location: locationSchema,
});

