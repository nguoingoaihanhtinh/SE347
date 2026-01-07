export interface CreateUserQueryParams {
  loginAfterCreate?: boolean;
}

export interface UserQueryParams {
  user_id?: string;
  email?: string;
  fullName?: string;
  role?: "user" | "admin" | "super_admin";
  page?: number;
  limit?: number;
}
