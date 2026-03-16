import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { PromoCode } from "../models/PromoCode.js";
import { PromoRedemption } from "../models/PromoRedemption.js";
import type {
  CreatePromoInput,
  UpdatePromoInput,
  PromoListQuery,
  ValidatePromoInput,
} from "../schemas/promo.schema.js";
import {
  calculatePromoDiscount,
  isPromoCurrentlyValid,
  normalizePromoCode,
} from "../utils/promo.js";

export async function listPromos(req: AuthRequest, res: Response) {
  const query = req.query as unknown as PromoListQuery;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (!query.includeDeleted) {
    filter.deletedAt = { $exists: false };
  }
  if (!query.includeInactive) {
    filter.isActive = true;
  }
  if (query.q && query.q.trim()) {
    const q = query.q.trim();
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const [promos, total] = await Promise.all([
    PromoCode.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PromoCode.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      promos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

export async function getPromoById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const promo = await PromoCode.findById(id);
  if (!promo || promo.deletedAt) throw new AppError("Promo not found", 404);
  res.json({ success: true, data: promo });
}

export async function createPromo(req: AuthRequest, res: Response) {
  const input = req.body as CreatePromoInput;
  const code = normalizePromoCode(input.code);

  if (input.endsAt && input.startsAt) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (endsAt <= startsAt) {
      throw new AppError("endsAt must be after startsAt", 400);
    }
  }

  const exists = await PromoCode.findOne({ code });
  if (exists && !exists.deletedAt) {
    throw new AppError("Ce code promo existe déjà", 409);
  }

  if (exists && exists.deletedAt) {
    // Reuse soft-deleted code by reactivating
    exists.deletedAt = undefined;
    exists.isActive = input.isActive ?? true;
    exists.description = input.description;
    exists.discountPercent = input.discountPercent;
    exists.appliesToProductIds = input.appliesToProductIds?.length
      ? input.appliesToProductIds
      : undefined;
    exists.minSubtotal = input.minSubtotal;
    exists.maxDiscountAmount = input.maxDiscountAmount;
    exists.startsAt = input.startsAt ? new Date(input.startsAt) : undefined;
    exists.endsAt = input.endsAt ? new Date(input.endsAt) : undefined;
    // Business rule: promo codes are single-use per client.
    exists.usageLimit = input.usageLimit;
    exists.usageLimitPerUser = 1;
    exists.createdByUserId = req.user?.id;
    await exists.save();

    return res.status(201).json({ success: true, data: exists });
  }

  const promo = new PromoCode({
    code,
    description: input.description,
    discountPercent: input.discountPercent,
    appliesToProductIds: input.appliesToProductIds?.length
      ? input.appliesToProductIds
      : undefined,
    minSubtotal: input.minSubtotal,
    maxDiscountAmount: input.maxDiscountAmount,
    startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
    endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    // Business rule: promo codes are single-use per client.
    usageLimit: input.usageLimit,
    usageLimitPerUser: 1,
    isActive: input.isActive ?? true,
    createdByUserId: req.user?.id,
  });

  await promo.save();

  res.status(201).json({ success: true, data: promo });
}

export async function updatePromo(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const input = req.body as UpdatePromoInput;

  const promo = await PromoCode.findById(id);
  if (!promo || promo.deletedAt) throw new AppError("Promo not found", 404);

  if (input.code) {
    const code = normalizePromoCode(input.code);
    const existing = await PromoCode.findOne({
      code,
      _id: { $ne: new mongoose.Types.ObjectId(id) },
      deletedAt: { $exists: false },
    });
    if (existing) throw new AppError("Ce code promo existe déjà", 409);
    promo.code = code;
  }

  if (input.description !== undefined) promo.description = input.description;
  if (input.discountPercent !== undefined) promo.discountPercent = input.discountPercent;
  if (input.appliesToProductIds !== undefined) {
    promo.appliesToProductIds = input.appliesToProductIds.length
      ? input.appliesToProductIds
      : undefined;
  }
  if (input.minSubtotal !== undefined) promo.minSubtotal = input.minSubtotal;
  if (input.maxDiscountAmount !== undefined) promo.maxDiscountAmount = input.maxDiscountAmount;
  if (input.startsAt !== undefined) promo.startsAt = input.startsAt ? new Date(input.startsAt) : undefined;
  if (input.endsAt !== undefined) promo.endsAt = input.endsAt ? new Date(input.endsAt) : undefined;
  // Business rule: promo codes are single-use per client.
  if (input.usageLimit !== undefined) promo.usageLimit = input.usageLimit;
  promo.usageLimitPerUser = 1;
  if (input.isActive !== undefined) promo.isActive = input.isActive;

  if (promo.startsAt && promo.endsAt && promo.endsAt <= promo.startsAt) {
    throw new AppError("endsAt must be after startsAt", 400);
  }

  await promo.save();
  res.json({ success: true, data: promo });
}

export async function deletePromo(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const promo = await PromoCode.findById(id);
  // Idempotent delete: if already deleted or missing, return success
  if (!promo || promo.deletedAt) {
    return res.json({ success: true, message: "Promo already deleted" });
  }
  promo.isActive = false;
  promo.deletedAt = new Date();
  await promo.save();
  res.json({ success: true, message: "Promo deleted" });
}

export async function validatePromo(req: AuthRequest, res: Response) {
  const input = req.body as ValidatePromoInput;
  const code = normalizePromoCode(input.code);
  const promo = await PromoCode.findOne({ code, deletedAt: { $exists: false } });
  if (!promo) throw new AppError("Ce code promo n'existe pas.", 404);

  const now = new Date();
  const validity = isPromoCurrentlyValid(promo, now);
  if (!validity.ok) throw new AppError(validity.reason, 400);

  const subtotal =
    input.subtotal ??
    input.items.reduce((sum, i) => sum + (i.amount || 0), 0);

  const discount = calculatePromoDiscount({
    promo,
    items: input.items.map((i) => ({
      productId: i.productId,
      productName: "",
      quantity: 1,
      unitPrice: 0,
      amount: i.amount,
    })),
    subtotal,
  });

  if (discount.discountAmount <= 0) {
    throw new AppError("Ce code promo ne s'applique pas à votre panier.", 400);
  }

  const userId = req.user?.id;
  const email = (input.email || req.user?.email || "").trim().toLowerCase() || undefined;

  const perUserLimit =
    promo.usageLimitPerUser === undefined ? 1 : promo.usageLimitPerUser;
  if (perUserLimit > 0) {
    if (!userId && !email) {
      throw new AppError("Veuillez vous identifier pour utiliser ce code promo.", 400);
    }
    const perUserFilter: Record<string, any> = { promoCodeId: promo._id };
    if (userId) perUserFilter.userId = userId;
    else perUserFilter.email = email;

    const usedCount = await PromoRedemption.countDocuments(perUserFilter);
    if (usedCount >= perUserLimit) {
      throw new AppError("Limite d'utilisation atteinte pour ce code promo.", 400);
    }
  }

  res.json({
    success: true,
    data: {
      code: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount: discount.discountAmount,
      eligibleProductIds: discount.eligibleProductIds,
      appliesToProductIds: promo.appliesToProductIds || null,
    },
  });
}
