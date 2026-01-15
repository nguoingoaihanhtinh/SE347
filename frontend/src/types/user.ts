export type UserRole = "user" | "admin" | "super_admin";

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  notifications: {
    email?: boolean;
    push?: boolean;
    projectUpdates?: boolean;
    issueAssignments?: boolean;
  } | null;
  lastLoginAt: string | null;
  isActive: boolean;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileParams {
  fullName?: string;
  avatar?: string | null;
  notifications?: {
    email?: boolean;
    push?: boolean;
    projectUpdates?: boolean;
    issueAssignments?: boolean;
  } | null;
}
