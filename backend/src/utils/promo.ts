import type { IOrderItem } from "../models/Order.js";
import type { IPromoCode } from "../models/PromoCode.js";

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase();
}

export function isPromoCurrentlyValid(promo: IPromoCode, now: Date) {
  if (promo.deletedAt) return { ok: false, reason: "Ce code promo n'existe pas." };
  if (!promo.isActive) return { ok: false, reason: "Ce code promo est désactivé." };
  if (promo.startsAt && now < promo.startsAt) {
    return { ok: false, reason: "Ce code promo n'est pas encore actif." };
  }
  if (promo.endsAt && now > promo.endsAt) {
    return { ok: false, reason: "Ce code promo a expiré." };
  }
  if (promo.usageLimit !== undefined && promo.timesUsed >= promo.usageLimit) {
    return { ok: false, reason: "Ce code promo a atteint sa limite d'utilisation." };
  }
  return { ok: true as const };
}

export function calculatePromoDiscount(args: {
  promo: IPromoCode;
  items: IOrderItem[];
  subtotal: number;
}) {
  const { promo, items, subtotal } = args;

  if (promo.minSubtotal !== undefined && subtotal < promo.minSubtotal) {
    return { discountAmount: 0, eligibleSubtotal: 0, eligibleProductIds: [] as number[] };
  }

  const appliesTo =
    promo.appliesToProductIds && promo.appliesToProductIds.length > 0
      ? new Set(promo.appliesToProductIds)
      : null;

  const eligibleItems = appliesTo
    ? items.filter((i) => appliesTo.has(i.productId))
    : items;

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  if (eligibleSubtotal <= 0 || promo.discountPercent <= 0) {
    return { discountAmount: 0, eligibleSubtotal, eligibleProductIds: eligibleItems.map((i) => i.productId) };
  }

  let discountAmount = eligibleSubtotal * (promo.discountPercent / 100);
  if (promo.maxDiscountAmount !== undefined) {
    discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
  }
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  return {
    discountAmount,
    eligibleSubtotal,
    eligibleProductIds: Array.from(new Set(eligibleItems.map((i) => i.productId))),
  };
}

