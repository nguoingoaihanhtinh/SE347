import { z } from "zod";

const teamMemberRoles = ["owner", "admin", "member", "viewer"] as const;

export const inviteMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  inviteeEmail: z.string().email("Invalid email address"),
  role: z
    .enum(teamMemberRoles)
    .refine((val) => teamMemberRoles.includes(val), { message: "Role must be one of: owner, admin, member, viewer" }),
});

export const updateMemberRoleSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  newRole: z
    .enum(teamMemberRoles)
    .refine((val) => teamMemberRoles.includes(val), { message: "Role must be one of: owner, admin, member, viewer" }),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

export const removeMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export const cancelInvitationSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  invitationId: z.string().min(1, "Invitation ID is required"),
});

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;
export type RemoveMemberDto = z.infer<typeof removeMemberSchema>;
export type CancelInvitationDto = z.infer<typeof cancelInvitationSchema>;
