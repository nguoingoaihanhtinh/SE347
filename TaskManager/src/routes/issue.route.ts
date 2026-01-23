// src/routes/issue.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createIssue,
  deleteIssue,
  getIssueById,
  getIssues,
  updateIssue,
  getMyTasks,
  getIssuesForBoard,
} from "@/handlers/issue.handler";

// ✅ Thêm mergeParams: true
const router = Router({ mergeParams: true });

// Jira-like: all issue reads require authentication
router.get("/my-tasks", authenticate, getMyTasks);
router.get("/board", authenticate, getIssuesForBoard);
router.get("/", authenticate, getIssues);
router.get("/:id", authenticate, getIssueById);
router.post("/", authenticate, createIssue);
router.put("/:id", authenticate, updateIssue);
router.delete("/:id", authenticate, deleteIssue);

export default router;
