// src/dtos/issue/UpdateIssue.dto.ts
import { z } from "zod";

const issueType = z.enum(["task", "story", "bug", "epic"]);
const issuePriority = z.enum(["low", "medium", "high", "critical"]);

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  description: z.string().optional(),
  storyPoint: z.number().int().min(0).optional(),
  type: issueType.optional(),
  priority: issuePriority.optional(),
  columnId: z.string().optional(),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  teamId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});
