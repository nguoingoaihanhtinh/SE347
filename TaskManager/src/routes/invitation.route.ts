// src/routes/invitation.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { acceptInvitation, declineInvitation } from "@/handlers/project-member.handler";

const router = Router();

router.post("/:token/accept", authenticate, acceptInvitation);

router.post("/:token/decline", authenticate, declineInvitation);

export default router;
