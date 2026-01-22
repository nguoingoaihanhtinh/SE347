// src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar: string | null;
  role: "user" | "admin" | "super_admin";
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeam {
  _id?: string;
  id?: string;
  projectId: string;
  name: string;
  description: string;
  permissionKeys: string[];
  memberIds: string[];
  members?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  _id?: string;
  id?: string;
  projectId: string;
  teamIds: string[];
  userId: string;
  user?: User;
  role: "admin" | "member" | "viewer";
  isPending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: string;
  id?: string;
  content?: string;
  issueId: string;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityChange {
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface Activity {
  _id?: string;
  id?: string;
  projectId: string;
  issueId: string;
  userId?: string;
  userName?: string;
  actionType?: string;
  changes?: ActivityChange[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  _id?: string;
  id?: string;
  label: string;
  description: string;
  resource: string;
  action: string;
  key: string;
}

// API Response types
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
