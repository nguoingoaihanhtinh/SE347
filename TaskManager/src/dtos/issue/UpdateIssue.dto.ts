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
  sprintId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  attachments: z.array(z.string()).nullable().optional(),
  dueDateFrom: z.string().datetime().nullable().optional(),
  dueDateTo: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});
