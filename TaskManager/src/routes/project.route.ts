// routes/project.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "@/handlers/project.handler";
import { getProjectActivities } from "@/handlers/activity.handler";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", authenticate, createProject);
router.put("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);
router.get("/:projectId/activities", authenticate, getProjectActivities);
export default router;
