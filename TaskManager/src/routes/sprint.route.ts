import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { createSprint, deleteSprint, getSprintById, getSprints, updateSprint } from "@/handlers/sprint.handler";

const router = Router();

// GET /api/sprints?projectId=xxx
router.get("/", getSprints);

// CRUD by ID
router.get("/:id", getSprintById);
router.post("/", authenticate, createSprint);
router.put("/:id", authenticate, updateSprint);
router.delete("/:id", authenticate, deleteSprint);

export default router;
