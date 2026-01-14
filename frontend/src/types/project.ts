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
  createdAt: string;
  updatedAt: string;
  columns?: IColumn[];
}

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
