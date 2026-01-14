export type UserRole = "user" | "admin" | "super_admin";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  avatar: string | null;
  role: UserRole;
  is_email_verified: boolean;
  notifications: {
    email?: boolean;
    push?: boolean;
    project_updates?: boolean;
    issue_assignments?: boolean;
  } | null;
  last_login_at: string | null;
  is_active: boolean;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileParams {
  full_name?: string;
  avatar?: string | null;
  notifications?: {
    email?: boolean;
    push?: boolean;
    project_updates?: boolean;
    issue_assignments?: boolean;
  } | null;
}
