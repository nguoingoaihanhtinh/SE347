// Project Member models
import { ProjectMember } from "./project.model";

export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export interface ProjectInvitation {
  _id?: string;
  id?: string;
  projectId: string;
  inviterUserId: string;
  inviteeEmail: string;
  role: TeamMemberRole;
  token: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberWithDetails extends ProjectMember {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  inviter?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ProjectMemberStats {
  totalMembers: number;
  ownerCount: number;
  adminCount: number;
  memberCount: number;
  viewerCount: number;
  pendingInvitations: number;
}
