// src/lib/api.ts
import axios from "axios";
import type { User, Comment, AuthResponse, ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // ✅ Đảm bảo có /api
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptors (giữ nguyên nếu đã có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Comment API (GIỮ NGUYÊN)
export const commentApi = {
  getByIssue: (issueId: string) => api.get<ApiResponse<Comment[]>>("/api/comments", { params: { issueId } }),

  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>("/api/comments", data),

  update: (id: string, data: Partial<Comment>) => api.put<ApiResponse<Comment>>(`/api/comments/${id}`, data),

  delete: (id: string) => api.delete(`/api/comments/${id}`),
};

export default api;
