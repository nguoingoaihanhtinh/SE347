// src/apis/project.ts
import { api, type ResponseApi } from "../lib/api";
import {
  type IProject,
  type IColumn,
  type CreateColumnProjectParams,
  type UpdateColumnProjectParams,
  type UpdateColumnOrderParams,
} from "../types/project";
import type { ProjectMember } from "../types"; // ✅ Import từ index.ts

const config = {
  withCredentials: true,
};
interface ReorderColumnsParams {
  columnOrders: { columnId: string; order: number }[];
}
export const projects = {
  list: (params?: { page?: number; limit?: number; ownerId?: string }) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    if (params?.ownerId) url.append("ownerId", params.ownerId);

    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<ResponseApi<IProject[]>>(`/projects${queryString}`, config);
  },

  getById: (projectId: string) => api.get<ResponseApi<IProject>>(`/projects/${projectId}`, config),

  create: (projectData: {
    name: string;
    key: string;
    description?: string | null;
    access: "public" | "private";
    type: "scrum" | "kanban";
  }) => api.post<ResponseApi<IProject>>("/projects", projectData, config),

  update: (projectId: string, projectData: Partial<IProject>) =>
    api.put<ResponseApi<IProject>>(`/projects/${projectId}`, projectData, config),

  delete: (projectId: string) => api.delete<ResponseApi<void>>(`/projects/${projectId}`, config),

  getActivities: (projectId: string) => api.get<ResponseApi<any[]>>(`/projects/${projectId}/activities`, config),

  // ✅ Sửa getMembers: thay any[] → ProjectMember[]
  getMembers: (
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      role?: string;
      search?: string;
    }
  ) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    if (params?.role) url.append("role", params.role);
    if (params?.search) url.append("search", params.search);

    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<
      ResponseApi<{
        data: ProjectMember[]; // ✅ Không còn any
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
      }>
    >(`/projects/${projectId}/members${queryString}`, config);
  },

  // ✅ Sửa inviteMember: trả về ProjectMember
  inviteMember: (
    projectId: string,
    data: {
      email: string;
      role: "admin" | "member" | "viewer";
    }
  ) => api.post<ResponseApi<ProjectMember>>(`/projects/${projectId}/members/invite`, data, config),

  leaveProject: (projectId: string) => api.post<ResponseApi<void>>(`/projects/${projectId}/leave`, config),

  getColumns: (projectId: string, params?: { withStats?: boolean }) => {
    const url = new URLSearchParams();
    if (params?.withStats) url.append("withStats", params.withStats.toString());
    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<ResponseApi<{ data: IColumn[] }>>(`/projects/${projectId}/columns${queryString}`, config);
  },

  createColumn: (projectId: string, data: CreateColumnProjectParams) =>
    api.post<ResponseApi<IColumn>>(`/projects/${projectId}/columns`, data, config),

  getColumnById: (projectId: string, columnId: string) =>
    api.get<ResponseApi<IColumn>>(`/projects/${projectId}/columns/${columnId}`, config),

  updateColumn: (projectId: string, columnId: string, data: UpdateColumnProjectParams) =>
    api.put<ResponseApi<IColumn>>(`/projects/${projectId}/columns/${columnId}`, data, config),

  deleteColumn: (projectId: string, columnId: string) =>
    api.delete<ResponseApi<void>>(`/projects/${projectId}/columns/${columnId}`, config),

  reorderColumns: (projectId: string, data: ReorderColumnsParams) =>
    api.put<ResponseApi<void>>(`/projects/${projectId}/columns/reorder`, data, config),

  initializeColumns: (projectId: string) =>
    api.post<ResponseApi<IColumn[]>>(`/projects/${projectId}/columns/initialize`, config),
};
