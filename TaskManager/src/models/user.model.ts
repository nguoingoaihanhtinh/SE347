// src/models/user.model.ts
export interface User {
  _id?: string;
  email: string;
  fullName: string;
  passwordHash: string;
  avatar?: string | null;
  role: "user" | "admin" | "super_admin";
  isEmailVerified: boolean;

  notifications?: {
    email?: boolean;
    push?: boolean;
    projectUpdates?: boolean;
    issueAssignments?: boolean;
  } | null;
  lastLoginAt?: Date | null;
  isActive?: boolean;
  deactivatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
