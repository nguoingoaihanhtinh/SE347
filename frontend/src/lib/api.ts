// src/lib/api.ts
import axios from "axios";
import type { User, Comment, AuthResponse, ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to header if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: Log when token is attached (only in development and not for auth endpoints)
      if (import.meta.env.DEV && !config.url?.includes("/auth/")) {
        console.log(`[API] Request to ${config.url} with auth token`);
      }
    } else if (import.meta.env.DEV && !config.url?.includes("/auth/")) {
      // Only warn for non-auth endpoints when token is missing
      console.warn(`[API] Request to ${config.url} WITHOUT auth token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors from server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're not already on an auth page
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
  }
);

export interface ResponseApi<T> {
  success: boolean;
  status_code: number;
  status: string;
  message: string;
  data?: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// For paginated API responses where pagination is at root level
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

// Auth API (GIỮ NGUYÊN)
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

  logout: () => {
    localStorage.removeItem("token");
    return api.post("/auth/logout");
  },
};

// User API (Admin)
export const userApi = {
  // GET /api/users - Get all users (with optional search/pagination)
  getAll: (params?: { search?: string; page?: number; limit?: number; exclude?: string }) =>
    api.get<PaginatedResponse<User[]>>("/users", { params }),

  // GET /api/users/:userId - Get user by ID
  getById: (userId: string) => api.get<ApiResponse<User>>(`/users/${userId}`),

  // POST /api/users - Create user (admin only)
  create: (data: { email: string; fullName: string; password: string; role: "user" | "admin" | "super_admin"; avatar?: string | null; isEmailVerified?: boolean }) =>
    api.post<ApiResponse<User>>("/users", data),

  // PUT /api/users/profile - Update own profile
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>("/users/profile", data),

  // PUT /api/users/:userId - Update user (admin only)
  updateUser: (userId: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${userId}`, data),

  // DELETE /api/users/:userId - Delete user (admin only)
  delete: (userId: string) => api.delete(`/users/${userId}`),
};

// Project API
export const projectApi = {
  // GET /api/projects - Get all projects
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string }) =>
    api.get<PaginatedResponse<Project[]>>("/projects", { params }),

  // GET /api/projects/:projectId - Get project by ID
  getById: (projectId: string) => api.get<ApiResponse<Project>>(`/projects/${projectId}`),

  // POST /api/projects - Create project
  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>("/projects", data),

  // PUT /api/projects/:projectId - Update project
  update: (projectId: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${projectId}`, data),

  // DELETE /api/projects/:projectId - Delete project
  delete: (projectId: string) => api.delete(`/projects/${projectId}`),
};

// Issue API (for dashboard stats)
export const issueApi = {
  // GET /api/issues - Get all issues (requires projectId or columnId in backend, but we'll try without for total count)
  getAll: (params?: { page?: number; limit?: number; projectId?: string; columnId?: string }) =>
    api.get<PaginatedResponse<unknown[]>>("/issues", { params }),
};

// Sprint API (for dashboard stats)
export const sprintApi = {
  // GET /api/sprints - Get all sprints
  getAll: (params?: { page?: number; limit?: number; projectId?: string }) =>
    api.get<PaginatedResponse<unknown[]>>("/sprints", { params }),
};

// Admin API - System Statistics Interface
export interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalIssues: number;
  activeIssues: number;
  totalSprints: number;
  activeSprints: number;
}

// Admin Project Interface (for admin project management)
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

export const adminApi = {
  // GET /api/admin/stats - Get system statistics
  getStats: () => api.get<ApiResponse<SystemStats>>("/admin/stats"),
  
  // GET /api/admin/projects - Get all projects (admin only)
  getProjects: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminProject[]>>("/admin/projects", { params }),
};

// Comment API (GIỮ NGUYÊN)
export const commentApi = {
  getByIssue: (issueId: string) => api.get<ApiResponse<Comment[]>>("/comments", { params: { issueId } }),

  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>("/comments", data),

  update: (id: string, data: Partial<Comment>) => api.put<ApiResponse<Comment>>(`/comments/${id}`, data),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
