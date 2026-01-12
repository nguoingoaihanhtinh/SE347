// src/routes/project.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

// Project handlers
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "@/handlers/project.handler";
import { getProjectActivities } from "@/handlers/activity.handler";
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

const router = Router();

// Public routes
router.get("/", getProjects);

// Protected routes
router.use(authenticate);
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
router.get("/:projectId/activities", getProjectActivities);

// Project column routes
router.get("/:projectId/columns", projectColumnHandler.getProjectColumns);
router.post("/:projectId/columns", projectColumnHandler.createColumn);
router.get("/:projectId/columns/:columnId", projectColumnHandler.getColumnById);
router.put("/:projectId/columns/:columnId", projectColumnHandler.updateColumn);
router.delete("/:projectId/columns/:columnId", projectColumnHandler.deleteColumn);
router.post("/:projectId/columns/:columnId/issues", projectColumnHandler.addIssueToColumn);
router.put("/:projectId/columns/reorder", projectColumnHandler.reorderColumns);
router.post("/:projectId/columns/initialize", projectColumnHandler.initializeDefaultColumns);

router.use("/:projectId/sprints", sprintRoutes);
router.use("/:projectId/issues", issueRoutes);

export default router;
