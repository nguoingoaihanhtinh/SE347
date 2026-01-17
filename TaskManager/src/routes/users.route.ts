import {
  createUser,
  deleteUser,
  deleteUserProfile,
  getUserById,
  getUserProfile,
  getUsers,
  updateUser,
  updateUserProfile,
} from "@/handlers/users.handler";
import { Router } from "express";
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware";

const router = Router();
// 🔒 Authenticated profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.delete("/profile", authenticate, deleteUserProfile);
// Public routes (no auth)
router.get("/", getUsers);
router.get("/:id", getUserById);

// Admin-only routes (require admin role)
router.post("/", authenticate, requireAdmin, createUser);
router.put("/:id", authenticate, requireAdmin, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
