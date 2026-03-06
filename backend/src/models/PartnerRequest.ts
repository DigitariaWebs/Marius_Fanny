import mongoose, { Schema, Document } from "mongoose";

export interface IPartnerRequest extends Document {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  hashedPassword: string;
  approvalToken: string;
  tokenExpires: Date;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const PartnerRequestSchema = new Schema<IPartnerRequest>(
  {
    businessName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    hashedPassword: { type: String, required: true },
    approvalToken: { type: String, required: true, select: false },
    tokenExpires: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PartnerRequest = mongoose.model<IPartnerRequest>(
  "PartnerRequest",
  PartnerRequestSchema
);
