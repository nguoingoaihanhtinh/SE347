// src/types/index.ts

export interface User {
  _id?: string;
  id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: "student" | "company" | "admin" | "user";
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  key: string;
  access: "public" | "private";
  type: "scrum" | "kanban";
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectColumn {
  _id?: string;
  id?: string;
  name: string;
  projectId: string;
  issueIds: string[];
  issues?: Issue[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  _id?: string;
  id?: string;
  name: string;
  dateStarted: Date;
  dateEnded: Date;
  duration: number;
  goal: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IssueType = "task" | "story" | "bug" | "epic";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface Issue {
  _id?: string;
  id?: string;
  title: string;
  key: string; // Auto-generated: PROJECT_KEY-NUMBER
  summary: string;
  description: string;
  storyPoint: number;
  type?: IssueType;
  priority?: IssuePriority;
  projectId: string;
  sprintId?: string;
  columnId: string;
  creatorId?: string;
  reporterId: string;
  assigneeId?: string;
  parentId?: string;
  teamId?: string;
  attachments: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  assignee?: User;
  reporter?: User;
  creator?: User;
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
