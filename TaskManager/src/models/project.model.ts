import { TeamMemberRole } from "./project-member.model";

// ProjectDomain model
export interface Project {
  id?: string;
  name: string;
  key: string;
  description?: string | null;
  access: "public" | "private";
  type: "scrum" | "kanban";
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectColumn {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  issueIds: string[];
  issues?: any[];
  order: number;
}

export type MemberStatus = "active" | "pending_invite" | "pending_request";

export interface ProjectMember {
  id?: string;
  projectId: string;
  teamIds: string[];
  userId: string;
  role: TeamMemberRole;
  isPending: boolean; // Deprecated: Use status instead
  status?: MemberStatus; // New: 'active' | 'pending_invite' | 'pending_request'
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  project?: any;
}
