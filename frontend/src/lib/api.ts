import axios from "axios";
import type { User, Comment, AuthResponse, ApiResponse } from "../types";
import { IIssue } from "@/types/issue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ HYBRID AUTH: Support both Cookie and Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Nếu có token, gửi qua Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      if (import.meta.env.DEV && !config.url?.includes("/auth/login") && !config.url?.includes("/auth/register")) {
        console.log(`[API] 🔑 Request to ${config.url} with Bearer token`);
      }
    } else {
      // Không có token, dùng cookie (withCredentials: true)
      if (import.meta.env.DEV && !config.url?.includes("/auth/")) {
        console.log(`[API] 🍪 Request to ${config.url} with cookie auth`);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ✅ FIXED: Chỉ redirect khi thực sự unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = ["/login", "/register", "/forgot-password"].includes(window.location.pathname);

      if (!isAuthPage) {
        console.warn("401 Unauthorized - clearing token and redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Prevent infinite redirect loops
        setTimeout(() => {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  },
);

export interface ResponseApi<T> {
  issue: IIssue;
  success: boolean;
  status_code: number;
  status: string;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: Pagination;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  ownerId: string;
  type: "scrum" | "kanban";
  access: "public" | "private";
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>("/auth/login", { email, password }),

  sendOtp: (email: string) => api.post<ApiResponse<{ message: string }>>("/auth/send-otp", { email }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
    otp: string;
  }) =>
    api.post<AuthResponse>("/auth/register", {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      confirm_password: data.confirmPassword,
      otp: data.otp,
    }),

  getCurrentUser: () => api.get<ApiResponse<User>>("/auth/me"),

  sendForgotOtp: (email: string) =>
    api.post<ApiResponse<{ message: string; email: string }>>("/auth/send-forgot-otp", { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post<ApiResponse<{ message: string; user?: User; token?: string }>>("/auth/reset-password", {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    }),

  logout: () => api.post("/auth/logout"),
};

// User API
export const userApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number; exclude?: string }) =>
    api.get<PaginatedResponse<User[]>>("/users", { params }),

  getById: (userId: string) => api.get<ApiResponse<User>>(`/users/${userId}`),

  create: (data: {
    email: string;
    fullName: string;
    password: string;
    role: "user" | "admin" | "super_admin";
    avatar?: string | null;
    isEmailVerified?: boolean;
  }) => api.post<ApiResponse<User>>("/users", data),

  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>("/users/profile", data),

  updateUser: (userId: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${userId}`, data),

  delete: (userId: string) => api.delete(`/users/${userId}`),
};

// Project API
export const projectApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string }) =>
    api.get<PaginatedResponse<Project[]>>("/projects", { params }),

  getById: (projectId: string) => api.get<ApiResponse<Project>>(`/projects/${projectId}`),

  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>("/projects", data),

  update: (projectId: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${projectId}`, data),

  delete: (projectId: string) => api.delete(`/projects/${projectId}`),
};

// Issue API
export const issueApi = {
  getAll: (params?: { page?: number; limit?: number; projectId?: string; columnId?: string }) =>
    api.get<PaginatedResponse<unknown[]>>("/issues", { params }),
};

// Sprint API
export const sprintApi = {
  getAll: (params?: { page?: number; limit?: number; projectId?: string }) =>
    api.get<PaginatedResponse<unknown[]>>("/sprints", { params }),
};

// Admin API
export interface SystemStats {
  counts: {
    totalUsers: number;
    totalProjects: number;
    totalIssues: number;
    activeIssues: number;
    totalSprints: number;
    activeSprints: number;
  };
  trends: {
    usersTrend: number;
    projectsTrend: number;
    activeIssuesTrend: number;
  };
  analytics: {
    userGrowth: Array<{ month: string; count: number }>;
    weeklyGrowth?: Array<{ week: string; name: string; count: number }>;
    projectDistribution: Array<{ name: string; value: number }>;
    issueAgeBuckets?: Array<{ bucket: string; openCount: number; closedCount: number }>;
    resolutionStats: {
      avgDays: number;
      trend: Array<{ date: string; avgDays: number }>;
      trendPercentage: number | null;
    };
    latestProjects: Array<{
      id: string;
      name: string;
      key: string;
      type: "scrum" | "kanban";
      createdAt: string;
      ownerName: string;
    }>;
  };
}

export interface AdminProject {
  id: string;
  name: string;
  key: string;
  description: string | null;
  access: "public" | "private";
  type: "scrum" | "kanban";
  ownerId: string;
  owner: {
    id: string;
    email: string;
    fullName: string;
  };
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Admin Stats Response - Backend returns direct format: { success, counts, trends, analytics }
export interface AdminStatsResponse {
  success: boolean;
  counts: SystemStats["counts"];
  trends: SystemStats["trends"];
  analytics: SystemStats["analytics"];
}

export const adminApi = {
  // GET /api/admin/stats - Get system statistics
  // Backend returns: { success, counts, trends, analytics } (NOT wrapped in data)
  getStats: () => api.get<AdminStatsResponse>("/admin/stats"),

  // GET /api/admin/projects - Get all projects (admin only)
  getProjects: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: "scrum" | "kanban";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => api.get<PaginatedResponse<AdminProject[]>>("/admin/projects", { params }),
};

// Comment API
export const commentApi = {
  getByIssue: (issueId: string) => api.get<ApiResponse<Comment[]>>("/comments", { params: { issueId } }),

  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>("/comments", data),

  update: (id: string, data: Partial<Comment>) => api.put<ApiResponse<Comment>>(`/comments/${id}`, data),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
