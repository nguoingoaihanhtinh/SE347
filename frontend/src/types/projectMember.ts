export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  teamIds: string[];
  role: TeamMemberRole;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviterUserId: string;
  inviteeEmail: string;
  role: TeamMemberRole;
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberStats {
  totalMembers: number;
  ownerCount: number;
  adminCount: number;
  memberCount: number;
  viewerCount: number;
  pendingInvitations: number;
}

export interface InvitationDetails {
  projectId: string;
  projectName: string;
  inviterName: string;
  role: TeamMemberRole;
  expiresAt: string;
}
