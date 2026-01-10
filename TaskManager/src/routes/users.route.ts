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
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();
// 🔒 Authenticated profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.delete("/profile", authenticate, deleteUserProfile);
// Public routes (no auth)
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);

// Admin/user management routes (may need admin auth)
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
