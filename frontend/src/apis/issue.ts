// src/apis/issue.ts
import { api, type ResponseApi } from "../lib/api";
import {
  type IssueType,
  type IssuePriority,
  type IIssue,
  type CreateIssueParams,
  type UpdateIssueParams,
} from "../types/issue";

const config = {
  withCredentials: true,
};

export const issues = {
  myTasks: async (params?: { page?: number; limit?: number }) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<
      ResponseApi<{
        data: IIssue[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
      }>
    >(`/issues/my-tasks${queryString}`, config);
  },

  board: async (projectId: string, params?: { page?: number; limit?: number }) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    const queryString = url.toString() ? `?${url.toString()}` : "";

    return api.get<ResponseApi<any>>(`/projects/${projectId}/issues/board${queryString}`, config);
  },

  list: async (params: {
    projectId: string;
    page?: number;
    limit?: number;
    columnId?: string;
    assigneeId?: string;
    priority?: IssuePriority;
    type?: IssueType;
    search?: string;
  }) => {
    const url = new URLSearchParams();
    if (params.page) url.append("page", params.page.toString());
    if (params.limit) url.append("limit", params.limit.toString());
    if (params.columnId) url.append("columnId", params.columnId);
    if (params.assigneeId) url.append("assigneeId", params.assigneeId);
    if (params.priority) url.append("priority", params.priority);
    if (params.type) url.append("type", params.type);
    if (params.search) url.append("search", params.search);

    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<
      ResponseApi<{
        data: IIssue[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
      }>
    >(`/projects/${params.projectId}/issues${queryString}`, config);
  },

  getById: (projectId: string, issueId: string) =>
    api.get<ResponseApi<IIssue>>(`/projects/${projectId}/issues/${issueId}`, config),

  create: (projectId: string, issueData: CreateIssueParams) =>
    api.post<ResponseApi<IIssue>>(`/projects/${projectId}/issues`, issueData, config),

  update: (projectId: string, issueId: string, issueData: UpdateIssueParams) =>
    api.put<ResponseApi<IIssue>>(`/projects/${projectId}/issues/${issueId}`, issueData, config),

  delete: (projectId: string, issueId: string) =>
    api.delete<ResponseApi<void>>(`/projects/${projectId}/issues/${issueId}`, config),
};
