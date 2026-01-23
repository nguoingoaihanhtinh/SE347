export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "pending_invite" | "pending_request";

export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: TeamMemberRole;
  isPending: boolean; // Deprecated: Use status instead
  status?: MemberStatus; // New: 'active' | 'pending_invite' | 'pending_request'
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    avatar: string | null;
  };
  project?: {
    id: string;
    name: string;
    key: string;
    description?: string | null;
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
