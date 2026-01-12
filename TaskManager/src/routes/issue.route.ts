// src/routes/issue.route.ts
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { createIssue, deleteIssue, getIssueById, getIssues, updateIssue } from "@/handlers/issue.handler";

// ✅ Thêm mergeParams: true
const router = Router({ mergeParams: true });

router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post("/", authenticate, createIssue);
router.put("/:id", authenticate, updateIssue);
router.delete("/:id", authenticate, deleteIssue);

export default router;
