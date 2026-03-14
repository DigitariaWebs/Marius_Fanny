import mongoose, { Schema, Document } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  description?: string;
  discountPercent: number;
  appliesToProductIds?: number[];
  minSubtotal?: number;
  maxDiscountAmount?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  deletedAt?: Date;
  usageLimit?: number;
  usageLimitPerUser?: number;
  timesUsed: number;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    appliesToProductIds: {
      type: [Number],
      default: undefined,
      index: true,
    },
    minSubtotal: {
      type: Number,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    startsAt: {
      type: Date,
      index: true,
    },
    endsAt: {
      type: Date,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    usageLimitPerUser: {
      type: Number,
      min: 0,
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdByUserId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

PromoCodeSchema.index({ code: 1, deletedAt: 1 });
PromoCodeSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export const PromoCode = mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

