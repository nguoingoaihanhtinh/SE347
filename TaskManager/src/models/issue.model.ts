// src/models/issue.model.ts
export type IssueType = "task" | "story" | "bug" | "epic";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface Issue {
  id?: string;
  title: string;
  key: string;
  summary: string;
  description: string;
  storyPoint: number;
  type?: IssueType;
  priority?: IssuePriority;
  projectId: string;
  sprintId?: string;
  columnId: string;
  creatorId?: string;
  reporterId: string;
  assigneeId?: string;
  parentId?: string;
  teamId?: string;
  attachments: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
