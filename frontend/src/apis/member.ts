import api, { type ResponseApi } from "../lib/api";
import type { TeamMemberRole } from "../types/projectMember";
const config = {
  withCredentials: true,
};

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
  projectName: string;
  inviterName: string;
  role: TeamMemberRole;
  expiresAt: string;
}

export const memberApi = {
  // ========== INVITATION MANAGEMENT ==========
  // POST /api/projects/:projectId/members/invite - Invite member to project
  inviteMember: (projectId: string, data: { email: string; role: TeamMemberRole }) =>
    api.post<ResponseApi<{ success: boolean; message: string; invitation?: ProjectInvitation }>>(
      `/projects/${projectId}/members/invite`,
      data,
      config,
    ),

  // GET /api/projects/members/my-invitations - Get current user's invitations
  getMyInvitations: () => api.get<ResponseApi<ProjectInvitation[]>>("/projects/members/my-invitations", config),

  // POST /api/projects/:projectId/accept-invitation/:token - Accept invitation (authenticated)
  acceptInvitation: (token: string) =>
    api.post<ResponseApi<{ success: boolean; message: string; member?: ProjectMember }>>(
      `/projects/accept-invitation`,
      { token }, // ← Gửi token trong body
      config,
    ),
  // POST /api/projects/members/decline/:token - Decline invitation (authenticated)
  declineInvitation: (token: string) =>
    api.post<ResponseApi<{ success: boolean; message: string }>>(`/projects/members/decline/${token}`, {}, config),

  // GET /api/invitations/:token - Get invitation details (public, no auth)
  getInvitationDetails: (token: string) => api.get<ResponseApi<InvitationDetails>>(`/invitations/${token}`),

  // POST /api/projects/members/cancel-invitation - Cancel invitation
  cancelInvitation: (data: { projectId: string; invitationId: string }) =>
    api.post<ResponseApi<{ success: boolean; message: string }>>("/projects/members/cancel-invitation", data, config),

  // ========== MEMBER MANAGEMENT ==========
  // GET /api/projects/:projectId/members - Get project members
  getProjectMembers: (projectId: string) =>
    api.get<ResponseApi<ProjectMember[]>>(`/projects/${projectId}/members`, config),

  // GET /api/projects/:projectId/stats - Get project member stats
  getProjectStats: (projectId: string) =>
    api.get<ResponseApi<ProjectMemberStats>>(`/projects/${projectId}/stats`, config),

  // POST /api/projects/members/update-role - Update member role
  updateMemberRole: (data: { projectId: string; memberId: string; newRole: TeamMemberRole }) =>
    api.post<ResponseApi<{ success: boolean; message: string; member?: ProjectMember }>>(
      "/projects/members/update-role",
      data,
      config,
    ),

  // POST /api/projects/members/remove - Remove member from project
  removeMember: (data: { projectId: string; memberId: string }) =>
    api.post<ResponseApi<{ success: boolean; message: string }>>("/projects/members/remove", data, config),

  // POST /api/projects/:projectId/leave - Leave project
  leaveProject: (projectId: string) =>
    api.post<ResponseApi<{ success: boolean; message: string }>>(`/projects/${projectId}/leave`, {}, config),
};
