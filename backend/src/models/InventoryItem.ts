import { Schema, model } from "mongoose";

export interface IInventoryItem {
  productId: number;
  productName: string;
  location: "Montreal" | "Laval";
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    productId: { type: Number, required: true, index: true },
    productName: { type: String, required: true, trim: true },
    location: { type: String, enum: ["Montreal", "Laval"], required: true, index: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

InventoryItemSchema.index({ productId: 1, location: 1 }, { unique: true });

export const InventoryItem = model<IInventoryItem>(
  "InventoryItem",
  InventoryItemSchema,
);

