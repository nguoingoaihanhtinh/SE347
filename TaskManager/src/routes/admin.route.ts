// src/routes/admin.route.ts
import { Router } from "express";
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware";
import { getSystemStats, getAllProjectsAdmin } from "@/handlers/admin.handler";

const router = Router();

// All admin routes require authentication and admin role
router.get("/stats", authenticate, requireAdmin, getSystemStats);
router.get("/projects", authenticate, requireAdmin, getAllProjectsAdmin);

export default router;
