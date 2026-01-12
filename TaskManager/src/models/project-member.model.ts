import { ObjectId } from "mongodb";
import { ProjectMember } from "./project.model";

export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export interface ProjectInvitation {
  _id?: ObjectId | string;
  id?: string;
  projectId: ObjectId | string;
  inviterUserId: ObjectId | string;
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
}

export interface ProjectMemberStats {
  totalMembers: number;
  ownerCount: number;
  adminCount: number;
  memberCount: number;
  viewerCount: number;
  pendingInvitations: number;
}
