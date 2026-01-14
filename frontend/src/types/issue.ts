// src/types/issue.ts
export type IssueType = "task" | "story" | "bug" | "epic";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface IIssue {
  id: string;
  title: string;
  key: string;
  summary: string;
  description: string;
  storyPoint: number;
  type: IssueType;
  priority: IssuePriority;

  projectId: string;
  sprintId: string | null;
  columnId: string;
  creatorId: string | null;
  reporterId: string;
  assigneeId: string | null;
  parentId: string | null;
  teamId: string | null;
  attachments: string[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IIssueWithoutColumn {
  id: string;
  title: string;
  key: string;
  summary: string;
  description: string;
  storyPoint: number;
  type: IssueType;
  priority: IssuePriority;

  projectId: string;
  sprintId: string | null;
  creatorId: string | null;
  reporterId: string;
  assigneeId: string | null;
  parentId: string | null;
  teamId: string | null;
  attachments: string[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueParams {
  title: string;
  summary: string;
  description: string;
  storyPoint: number;
  type: IssueType;
  priority: IssuePriority;
  projectId: string;
  columnId: string;
  reporterId: string;
}

export interface UpdateIssueParams {
  title?: string;
  summary?: string;
  description?: string;
  storyPoint?: number;
  type?: IssueType;
  priority?: IssuePriority;

  sprintId?: string | null;
  columnId?: string;
  assigneeId?: string | null;
  dueDateFrom?: string | null;
  dueDateTo?: string | null;
  completedAt?: string | null;
}

export interface ListIssuesParams {
  projectId: string;
  page?: number;
  limit?: number;

  priority?: IssuePriority[];
  type?: IssueType[];
  assigneeId?: string;
  sprintId?: string;
  search?: string;
}
