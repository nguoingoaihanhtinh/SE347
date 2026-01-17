export interface CreateUserQueryParams {
  loginAfterCreate?: boolean;
}

export interface UserQueryParams {
  userId?: string;
  email?: string;
  fullName?: string;
  role?: "user" | "admin" | "super_admin";
  search?: string; // For fuzzy search on email/fullName
  page?: number;
  limit?: number;
}
