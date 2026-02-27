import { Request, Response } from "express";
import type { ApiResponse } from "../types/api.js";
import { ProductionItemStatus } from "../models/ProductionItemStatus.js";

export const getInventory = async (req: Request, res: Response<ApiResponse>) => {
  const { location } = req.query as { location?: "Montreal" | "Laval" };

  const match: any = { done: false };
  if (location) match.location = location;

  const items = await ProductionItemStatus.aggregate([
    { $match: match },
    // Prefer newest productName if it ever changes.
    { $sort: { updatedAt: -1 } },
    {
      $group: {
        _id: { productId: "$productId", location: "$location" },
        productId: { $first: "$productId" },
        productName: { $first: "$productName" },
        location: { $first: "$location" },
        quantity: { $sum: "$quantity" },
      },
    },
    { $match: { quantity: { $gt: 0 } } },
    { $sort: { location: 1, productName: 1 } },
    // Keep frontend contract similar (it expects `_id`).
    { $addFields: { _id: { $concat: [{ $toString: "$productId" }, "-", "$location"] } } },
  ]);

  res.json({
    success: true,
    data: { items },
  });
};
