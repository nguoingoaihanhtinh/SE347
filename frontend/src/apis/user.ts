import api, { type ResponseApi } from "../lib/api";
import { type IUser, type UpdateUserProfileParams } from "../types/user";

const config = {
  withCredentials: true,
};

export const users = {
  // GET /api/users - Get all users (public)
  list: (params?: { page?: number; limit?: number; search?: string; role?: "user" | "admin" | "super_admin" }) => {
    const url = new URLSearchParams();
    if (params?.page) url.append("page", params.page.toString());
    if (params?.limit) url.append("limit", params.limit.toString());
    if (params?.search) url.append("search", params.search);
    if (params?.role) url.append("role", params.role);

    const queryString = url.toString() ? `?${url.toString()}` : "";
    return api.get<
      ResponseApi<{
        data: IUser[]; // ✅ THÊM "data" property
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
      }>
    >(`/users${queryString}`, config);
  },

  // GET /api/users/:id - Get user by ID (public)
  getById: (userId: string) => api.get<ResponseApi<IUser>>(`/users/${userId}`, config),

  // POST /api/users - Create new user (public)
  create: (userData: { email: string; fullName: string; password: string; role?: "user" | "admin" | "super_admin" }) =>
    api.post<ResponseApi<IUser>>("/users", userData, config),

  // 🔒 Authenticated profile routes

  // GET /api/users/profile - Get own profile (authenticated)
  getMe: () => api.get<ResponseApi<IUser>>("/users/profile", config),

  // PUT /api/users/profile - Update own profile (authenticated)
  updateProfile: (userData: UpdateUserProfileParams) => api.put<ResponseApi<IUser>>("/users/profile", userData, config),

  // DELETE /api/users/profile - Delete own account (authenticated)
  deleteProfile: () => api.delete<ResponseApi<void>>("/users/profile", config),

  // Admin/user management routes

  // PUT /api/users/:id - Update user (authenticated, may need admin)
  update: (userId: string, userData: Partial<IUser>) =>
    api.put<ResponseApi<IUser>>(`/users/${userId}`, userData, config),

  // DELETE /api/users/:id - Delete user (authenticated, may need admin)
  delete: (userId: string) => api.delete<ResponseApi<void>>(`/users/${userId}`, config),

  // Password and stats (keep existing if still needed)
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<ResponseApi<void>>("/users/change-password", data, config),

  getUserStats: (body: { id: string; is_sprintId: boolean }) =>
    api.post<ResponseApi<any>>(`/users/stats/`, body, config),

  // Search users by email
  search: (query: string) => {
    const url = new URLSearchParams();
    url.append("query", query);
    return api.get<ResponseApi<Array<{ id: string; email: string; fullName: string; avatar: string | null }>>>(
      `/users/search?${url.toString()}`,
      config
    );
  },
};
