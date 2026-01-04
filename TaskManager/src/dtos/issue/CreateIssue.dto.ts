// src/dtos/issue/CreateIssue.dto.ts
import { z } from "zod";

const issueType = z.enum(["task", "story", "bug", "epic"]);
const issuePriority = z.enum(["low", "medium", "high", "critical"]);

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required").optional(),
  description: z.string().optional(),
  storyPoint: z.number().int().min(0).default(0),
  type: issueType.optional(),
  priority: issuePriority.optional(),
  projectId: z.string().min(1, "Project ID is required"),
  columnId: z.string().min(1, "Column ID is required").optional(),
  sprintId: z.string().optional(),
  creatorId: z.string().optional(),
  reporterId: z.string().min(1, "Reporter ID is required").optional(),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  teamId: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  dueDateFrom: z.string().min(1).optional(),
  dueDateTo: z.string().min(1).optional(),
});
