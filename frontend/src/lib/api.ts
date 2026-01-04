// src/lib/api.ts
import axios from "axios";
import type {
  User,
  Project,
  Sprint,
  Issue,
  Activity,
  Comment,
  ProjectColumn,
  AuthResponse,
  ApiResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to add auth token from localStorage (fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>("/api/auth/login", { email, password }),

  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>("/api/auth/register", data),

  getCurrentUser: () => api.get<ApiResponse<User>>("/api/auth/me"),

  logout: () => {
    localStorage.removeItem("token");
    return api.post("/api/auth/logout");
  },
};

// User API
export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>("/api/users"),

  getById: (id: string) => api.get<ApiResponse<User>>(`/api/users/${id}`),

  create: (data: Partial<User>) => api.post<ApiResponse<User>>("/api/users", data),

  update: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/api/users/${id}`, data),

  delete: (id: string) => api.delete(`/api/users/${id}`),
};

// Project API
export const projectApi = {
  getAll: () => api.get<ApiResponse<Project[]>>("/api/projects"),

  getById: (id: string) => api.get<ApiResponse<Project>>(`/api/projects/${id}`),

  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>("/api/projects", data),

  update: (id: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/api/projects/${id}`, data),

  delete: (id: string) => api.delete(`/api/projects/${id}`),

  getActivities: (projectId: string) => api.get<ApiResponse<Activity[]>>(`/api/projects/${projectId}/activities`),
};

// Sprint API
export const sprintApi = {
  getByProject: (projectId: string) => api.get<ApiResponse<Sprint[]>>("/api/sprints", { params: { projectId } }),

  getById: (id: string) => api.get<ApiResponse<Sprint>>(`/api/sprints/${id}`),

  create: (data: Partial<Sprint>) => api.post<ApiResponse<Sprint>>("/api/sprints", data),

  update: (id: string, data: Partial<Sprint>) => api.put<ApiResponse<Sprint>>(`/api/sprints/${id}`, data),

  delete: (id: string) => api.delete(`/api/sprints/${id}`),
};

// Issue API
export const issueApi = {
  getByProject: (projectId: string) => api.get<ApiResponse<Issue[]>>("/api/issues", { params: { projectId } }),

  getByColumn: (columnId: string) => api.get<ApiResponse<Issue[]>>("/api/issues", { params: { columnId } }),

  getById: (id: string) => api.get<ApiResponse<Issue>>(`/api/issues/${id}`),

  create: (data: Partial<Issue>) => api.post<ApiResponse<Issue>>("/api/issues", data),

  update: (id: string, data: Partial<Issue>) => api.put<ApiResponse<Issue>>(`/api/issues/${id}`, data),

  delete: (id: string) => api.delete(`/api/issues/${id}`),
};

// Comment API (if you need it)
export const commentApi = {
  getByIssue: (issueId: string) => api.get<ApiResponse<Comment[]>>("/api/comments", { params: { issueId } }),

  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>("/api/comments", data),

  update: (id: string, data: Partial<Comment>) => api.put<ApiResponse<Comment>>(`/api/comments/${id}`, data),

  delete: (id: string) => api.delete(`/api/comments/${id}`),
};

// Column API (if you need it)
export const columnApi = {
  getByProject: (projectId: string) => api.get<ApiResponse<ProjectColumn[]>>("/api/columns", { params: { projectId } }),

  create: (data: Partial<ProjectColumn>) => api.post<ApiResponse<ProjectColumn>>("/api/columns", data),

  update: (id: string, data: Partial<ProjectColumn>) => api.put<ApiResponse<ProjectColumn>>(`/api/columns/${id}`, data),

  delete: (id: string) => api.delete(`/api/columns/${id}`),
};

export default api;
