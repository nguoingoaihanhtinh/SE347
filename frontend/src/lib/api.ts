import axios from "axios";
import type { User, Comment, AuthResponse, ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      // console.log(`🔵 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      //   data: config.data,
      //   headers: config.headers,
      //   withCredentials: config.withCredentials,
      // });
    }
    return config;
  },
  (error) => {
    console.error("❌ [API Request Error]:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      // console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      //   status: response.status,
      //   data: response.data,
      // });
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      // console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      //   status: error.response?.status,
      //   statusText: error.response?.statusText,
      //   data: error.response?.data,
      //   message: error.message,
      // });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const isAuthPage = ["/login", "/register", "/forgot-password"].includes(window.location.pathname);

      if (!isAuthPage) {
        console.warn("401 Unauthorized - clearing token and redirecting to login");
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");

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

  logout: () => api.post("/auth/logout"),
};

// User API (Admin)
export const userApi = {
  // GET /api/users - Get all users (with optional search/pagination)
  getAll: (params?: { search?: string; page?: number; limit?: number; exclude?: string }) =>
    api.get<PaginatedResponse<User[]>>("/users", { params }),

  // GET /api/users/:userId - Get user by ID
  getById: (userId: string) => api.get<ApiResponse<User>>(`/users/${userId}`),

  // POST /api/users - Create user (admin only)
  create: (data: {
    email: string;
    fullName: string;
    password: string;
    role: "user" | "admin" | "super_admin";
    avatar?: string | null;
    isEmailVerified?: boolean;
  }) => api.post<ApiResponse<User>>("/users", data),

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
  }) =>
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
