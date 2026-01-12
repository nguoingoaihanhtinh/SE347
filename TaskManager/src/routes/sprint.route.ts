// src/routes/sprint.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { createSprint, deleteSprint, getSprintById, getSprints, updateSprint } from "@/handlers/sprint.handler";

// ✅ Thêm mergeParams: true
const router = Router({ mergeParams: true });

router.get("/", getSprints);
router.get("/:id", getSprintById);
router.post("/", authenticate, createSprint);
router.put("/: id", authenticate, updateSprint);
router.delete("/:id", authenticate, deleteSprint);

export default router;
