// src/routes/issue.route.ts
import { Router } from "express";
import { createIssue, deleteIssue, getIssueById, getIssues, updateIssue } from "@/handlers/issue.handler";

const router = Router();

// GET /api/issues?projectId=xxx → all issues in project
// GET /api/issues?columnId=xxx → all issues in column
router.get("/", getIssues);

router.get("/:id", getIssueById);
router.post("/", createIssue);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

export default router;
