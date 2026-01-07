// src/routes/project-member.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  inviteMember,
  acceptInvitation,
  declineInvitation,
  updateMemberRole,
  removeMember,
  getProjectMembers,
  getProjectStats,
  getUserInvitations,
  cancelInvitation,
  leaveProject,
} from "@/handlers/project-member.handler";

const router = Router();

// Protected routes (require authentication)
router.post("/invite", authenticate, inviteMember);
router.post("/accept-invitation", authenticate, acceptInvitation);
router.post("/update-role", authenticate, updateMemberRole);
router.post("/remove", authenticate, removeMember);
router.post("/cancel-invitation", authenticate, cancelInvitation);
router.get("/my-invitations", authenticate, getUserInvitations);
router.get("/:projectId/members", authenticate, getProjectMembers);
router.get("/:projectId/stats", authenticate, getProjectStats);
router.post("/:projectId/leave", authenticate, leaveProject);

// Public route for declining invitations (no auth required, uses token)
router.post("/decline-invitation/:token", declineInvitation);

export default router;
