import {
  createUser,
  deleteUser,
  deleteUserProfile,
  getUserById,
  getUserProfile,
  getUsers,
  searchUsers,
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
// Search users by email (authenticated)
router.get("/search", authenticate, searchUsers);
// Public routes (no auth)
router.get("/", getUsers);
router.get("/:id", getUserById);

// Admin-only routes (require admin role)
router.post("/", authenticate, requireAdmin, createUser);
router.put("/:id", authenticate, requireAdmin, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
