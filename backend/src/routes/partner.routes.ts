import { Router } from "express";
import {
  submitPartnerRequest,
  approvePartnerRequest,
  submitPartnerInquiry,
  invitePartner,
} from "../controllers/partner.controller.js";

const router = Router();

// POST /api/partner-request — submit a new partner application (with password, pending approval)
router.post("/", submitPartnerRequest);

// POST /api/partner-request/inquiry — homepage inquiry form (contact only, no account)
router.post("/inquiry", submitPartnerInquiry);

// GET /api/partner-request/invite/:encodedEmail — admin sends invitation to prospect
router.get("/invite/:encodedEmail", invitePartner);

// GET /api/partner-request/approve/:token — admin approval link (full partner with password)
router.get("/approve/:token", approvePartnerRequest);

export default router;
