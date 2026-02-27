import { Schema, model } from "mongoose";

export interface IProductionItemStatus {
  productionItemId: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  productId: number;
  productName: string;
  quantity: number;
  location: "Montreal" | "Laval";
  createdAt: Date;
  updatedAt: Date;
}

const ProductionItemStatusSchema = new Schema<IProductionItemStatus>(
  {
    productionItemId: { type: String, required: true, index: true, trim: true },
    date: { type: String, required: true, index: true, trim: true },
    done: { type: Boolean, required: true, default: false },
    productId: { type: Number, required: true, index: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, enum: ["Montreal", "Laval"], required: true, index: true },
  },
  { timestamps: true },
);

ProductionItemStatusSchema.index(
  { productionItemId: 1, date: 1 },
  { unique: true },
);

export const ProductionItemStatus = model<IProductionItemStatus>(
  "ProductionItemStatus",
  ProductionItemStatusSchema,
);

