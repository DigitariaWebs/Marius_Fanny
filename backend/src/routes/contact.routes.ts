import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/errorHandler.js";
import { submitContact } from "../controllers/contact.controller.js";

const router = Router();

// Multer in memory for CV attachments (max 5MB, PDF/DOC/DOCX only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF, DOC et DOCX sont acceptés."));
    }
  },
});

// POST /api/contact — public, optional CV file
router.post("/", upload.single("cv"), asyncHandler(submitContact));

export default router;
