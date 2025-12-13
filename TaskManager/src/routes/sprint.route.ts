import { Router } from "express";
import { createSprint, deleteSprint, getSprintById, getSprints, updateSprint } from "@/handlers/sprint.handler";

const router = Router();

// GET /api/sprints?projectId=xxx
router.get("/", getSprints);

// CRUD by ID
router.get("/:id", getSprintById);
router.post("/", createSprint);
router.put("/:id", updateSprint);
router.delete("/:id", deleteSprint);

export default router;
