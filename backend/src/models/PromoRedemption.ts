import mongoose, { Schema, Document } from "mongoose";

export interface IPromoRedemption extends Document {
  promoCodeId: mongoose.Types.ObjectId;
  code: string;
  orderId: mongoose.Types.ObjectId;
  userId?: string;
  email?: string;
  discountAmount: number;
  redeemedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromoRedemptionSchema = new Schema<IPromoRedemption>(
  {
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

PromoRedemptionSchema.index({ promoCodeId: 1, redeemedAt: -1 });
PromoRedemptionSchema.index({ promoCodeId: 1, email: 1 });
PromoRedemptionSchema.index({ promoCodeId: 1, userId: 1 });

export const PromoRedemption = mongoose.model<IPromoRedemption>(
  "PromoRedemption",
  PromoRedemptionSchema,
);

