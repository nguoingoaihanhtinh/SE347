// src/types/project.ts
import type { IIssueWithoutColumn } from "./issue";

export interface IProject {
  id: string;
  name: string;
  key: string;
  description: string | null;
  access: "public" | "private";
  type: "scrum" | "kanban";
  ownerId: string;
  // Relationship of current logged-in user to this project (computed by backend)
  relationship?: "owner" | "member" | "public";
  createdAt: string;
  updatedAt: string;
  columns?: IColumn[];
}

// Type for creating a project (without ownerId, as backend sets it from req.user.userId)
export type CreateProjectParams = Omit<IProject, "id" | "createdAt" | "updatedAt" | "ownerId">;

export interface IColumn {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  issues: IIssueWithoutColumn[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnProjectParams {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateColumnProjectParams {
  name?: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateColumnOrderParams {
  columnIds: string[];
}
export interface ColumnsApiResponse {
  success: boolean;
  data: IColumn[] | { data: IColumn[] } | { columns: IColumn[] };
  message?: string;
}
