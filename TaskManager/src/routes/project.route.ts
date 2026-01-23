import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

// Project handlers
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "@/handlers/project.handler";

import sprintRoutes from "./sprint.route";
import issueRoutes from "./issue.route";
// Project member handlers
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

// Project column handlers
import projectColumnHandler from "@/handlers/project-column.handler";

import activityRoutes from "./activity.route";

const router = Router();

// Protected routes - All project routes require authentication
router.use(authenticate);

// Get projects for current user (filtered by membership)
router.get("/", getProjects);
// Project member routes
router.get("/:projectId/members", getProjectMembers);
router.get("/:projectId/stats", getProjectStats);
router.post("/:projectId/members/invite", inviteMember);
router.put("/:projectId/members/:userId/role", updateMemberRole);
router.delete("/:projectId/members/:userId", removeMember);
router.post("/:projectId/leave", leaveProject);
// Project routes
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Activity routes
router.use("/:projectId/activities", activityRoutes);

// Project column routes
router.get("/:projectId/columns", projectColumnHandler.getProjectColumns);
router.post("/:projectId/columns", projectColumnHandler.createColumn);
router.get("/:projectId/columns/:columnId", projectColumnHandler.getColumnById);
router.put("/:projectId/columns/reorder", projectColumnHandler.reorderColumns);
router.put("/:projectId/columns/:columnId", projectColumnHandler.updateColumn);
router.delete("/:projectId/columns/:columnId", projectColumnHandler.deleteColumn);
router.post("/:projectId/columns/:columnId/issues", projectColumnHandler.addIssueToColumn);

router.post("/:projectId/columns/initialize", projectColumnHandler.initializeDefaultColumns);

router.use("/:projectId/sprints", sprintRoutes);
router.use("/:projectId/issues", issueRoutes);

export default router;
