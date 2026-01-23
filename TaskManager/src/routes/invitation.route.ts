// src/routes/invitation.route.ts
import { Router } from "express";
import { getInvitationDetails } from "@/handlers/project-member.handler";

const router = Router();

// Public route - chỉ để lấy thông tin invitation (không accept ngay)
router.get("/:token", getInvitationDetails);

export default router;
