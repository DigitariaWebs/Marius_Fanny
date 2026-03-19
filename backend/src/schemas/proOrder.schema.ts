import { z } from "zod";
import { addressSchema, clientInfoSchema, orderItemSchema } from "./order.schema.js";

export type CreateProOrderInput = z.infer<typeof createProOrderSchema>;

export const createProOrderSchema = z
  .object({
    clientInfo: clientInfoSchema,
    pickupDate: z.string().datetime().optional(),
    pickupLocation: z.enum(["Montreal", "Laval"]),
    deliveryType: z.enum(["pickup", "delivery"]),
    deliveryDate: z.string().optional(),
    deliveryTimeSlot: z.string().optional(),
    deliveryAddress: addressSchema.optional(),
    deliveryDistanceTier: z.enum(["lt20", "gt20"]).optional(),
    items: z.array(orderItemSchema).min(1, "Au moins un article est requis"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return Boolean(data.deliveryAddress) && Boolean(data.deliveryDistanceTier);
      }
      return true;
    },
    {
      message: "Adresse et distance requises pour une livraison professionnelle",
      path: ["deliveryAddress"],
    },
  );

