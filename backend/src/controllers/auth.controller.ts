import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// 1. DEMANDE DE RESET (Envoi de l'email)
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError("Email requis", 400));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError("Utilisateur non trouvé", 404));

    // Génération du token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // Valide 1h
    await user.save();

    // Configuration SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Marius & Fanny" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Réinitialisation de mot de passe",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #C5A065;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé à changer votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
          <a href="${resetLink}" style="background: #C5A065; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a>
          <p style="margin-top: 20px; font-size: 12px; color: gray;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Email envoyé" });
  } catch (error) {
    next(error);
  }
};

// 2. VALIDATION DU NOUVEAU MOT DE PASSE
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) return next(new AppError("Données manquantes", 400));

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return next(new AppError("Lien invalide ou expiré", 400));

    // Hachage du mot de passe pour Better Auth
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Nettoyage
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return res.status(200).json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    next(error);
  }
};