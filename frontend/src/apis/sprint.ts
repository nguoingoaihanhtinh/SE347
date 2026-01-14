// src/apis/sprint.ts
import { api, type ResponseApi } from "../lib/api";
import { type ISprint, type CreateSprintParams, type UpdateSprintParams } from "../types/sprint";

const config = {
  withCredentials: true,
};

export const sprints = {
  list: (projectId: string, params?: { page?: number; limit?: number }) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<
      ResponseApi<{
        data: ISprint[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
      }>
    >(`/projects/${projectId}/sprints${queryString}`, config);
  },

  getById: (projectId: string, sprintId: string) =>
    api.get<ResponseApi<ISprint>>(`/projects/${projectId}/sprints/${sprintId}`, config),

  create: (projectId: string, data: CreateSprintParams) =>
    api.post<ResponseApi<ISprint>>(`/projects/${projectId}/sprints`, data, config),

  update: (projectId: string, sprintId: string, data: UpdateSprintParams) =>
    api.put<ResponseApi<ISprint>>(`/projects/${projectId}/sprints/${sprintId}`, data, config),

  delete: (projectId: string, sprintId: string) =>
    api.delete<ResponseApi<void>>(`/projects/${projectId}/sprints/${sprintId}`, config),
};
