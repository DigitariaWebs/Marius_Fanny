import { Request, Response } from "express";
import { Settings } from "../models/Settings.js";

/**
 * GET /api/settings
 * Public - returns current site settings
 */
export async function getSettings(req: Request, res: Response) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json({ success: true, data: settings });
}

/**
 * PUT /api/settings
 * Admin only - update site settings
 */
export async function updateSettings(req: Request, res: Response) {
  const allowedFields = [
    "storeName",
    "contactEmail",
    "contactPhone",
    "contactPhoneMontreal",
    "address",
    "addressMontreal",
    "businessHoursLaval",
    "businessHoursMontreal",
    "emailOnNewOrder",
    "emailOnOrderConfirmed",
    "emailOnPaymentReceived",
    "emailOnOrderReady",
    "closedDates",
    "facebookUrl",
    "instagramUrl",
    "twitterUrl",
  ];

  const updateData: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(updateData);
  } else {
    Object.assign(settings, updateData);
    if (updateData.businessHoursLaval) settings.markModified("businessHoursLaval");
    if (updateData.businessHoursMontreal) settings.markModified("businessHoursMontreal");
    await settings.save();
  }

  res.json({ success: true, data: settings, message: "Paramètres mis à jour avec succès" });
}
