import { Request, Response } from "express";
import { sendContactEmail } from "../utils/mail.js";

/**
 * POST /api/contact
 * Public - handle contact form submissions (with optional CV file)
 */
export async function submitContact(req: Request, res: Response) {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !subject || !message) {
    res.status(400).json({ success: false, message: "Tous les champs sont requis." });
    return;
  }

  // Handle optional CV file (multer puts it on req.file)
  const file = (req as any).file as Express.Multer.File | undefined;

  try {
    await sendContactEmail({
      firstName,
      lastName,
      email,
      subject,
      message,
      cvFilename: file?.originalname,
      cvBuffer: file?.buffer,
      cvMimetype: file?.mimetype,
    });

    res.json({ success: true, message: "Message envoyé avec succès!" });
  } catch (error: any) {
    console.error("❌ Erreur envoi contact:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message. Veuillez réessayer." });
  }
}
