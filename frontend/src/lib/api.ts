// src/lib/api.ts
import axios from "axios";
import type { User, Comment, AuthResponse, ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// // Add token to header if available
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       // Debug: Log when token is attached (only in development and not for auth endpoints)
//       if (import.meta.env.DEV && !config.url?.includes("/auth/")) {
//         console.log(`[API] Request to ${config.url} with auth token`);
//       }
//     } else if (import.meta.env.DEV && !config.url?.includes("/auth/")) {
//       // Only warn for non-auth endpoints when token is missing
//       console.warn(`[API] Request to ${config.url} WITHOUT auth token`);
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// Handle errors from server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = ["/login", "/register", "/forgot-password"].includes(window.location.pathname);

      if (!isAuthPage) {
        console.warn("401 Unauthorized - redirect to login");

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

/* ================= AUTH API ================= */

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
    api.post<ApiResponse<{ message: string; user?: User }>>("/auth/reset-password", {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    }),

  logout: () => api.post("/auth/logout"),
};

/* ================= USER API ================= */

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

/* ================= PROJECT API ================= */

export const projectApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string }) =>
    api.get<PaginatedResponse<Project[]>>("/projects", { params }),

  getById: (projectId: string) => api.get<ApiResponse<Project>>(`/projects/${projectId}`),

  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>("/projects", data),

  update: (projectId: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${projectId}`, data),

  delete: (projectId: string) => api.delete(`/projects/${projectId}`),
};

/* ================= COMMENT API ================= */

export const commentApi = {
  getByIssue: (issueId: string) => api.get<ApiResponse<Comment[]>>("/comments", { params: { issueId } }),

  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>("/comments", data),

  update: (id: string, data: Partial<Comment>) => api.put<ApiResponse<Comment>>(`/comments/${id}`, data),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
