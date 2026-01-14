export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: TeamMemberRole;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    avatar: string | null;
  };
}

export interface InviteMemberParams {
  email: string;
  role: TeamMemberRole;
}

export interface UpdateMemberRoleParams {
  userId: string;
  role: TeamMemberRole;
}

export interface ProjectMemberStats {
  totalMembers: number;
  ownerCount: number;
  adminCount: number;
  memberCount: number;
  viewerCount: number;
  pendingInvitations: number;
}
