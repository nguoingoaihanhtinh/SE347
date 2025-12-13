// routes/project.route.ts
import { Router } from "express";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "@/handlers/project.handler";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
