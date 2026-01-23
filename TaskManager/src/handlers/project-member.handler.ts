// src/handlers/project-member.handler.ts
import { Request, Response } from "express";
import validate from "@/utils/validate";
import projectMemberService from "@/services/project-member.service";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  acceptInvitationSchema,
  removeMemberSchema,
  cancelInvitationSchema,
} from "@/dtos/project/ProjectMember.dto";

export async function inviteMember(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  const inviteData = validate.schema_validate(inviteMemberSchema, req.body);
  console.log("Invite Data:", inviteData);
  const result = await projectMemberService.inviteMember({
    projectId,
    inviterUserId: req.user!.userId,
    inviteeEmail: inviteData.email,
    role: inviteData.role,
  });

  res.status(200).json({
    success: true,
    result,
  });
}

export async function acceptInvitation(req: Request, res: Response) {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  const result = await projectMemberService.acceptInvitation({
    token,
    userId: req.user!.userId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}
export async function declineInvitation(req: Request, res: Response) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  const result = await projectMemberService.declineInvitation(token);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function updateMemberRole(req: Request, res: Response) {
  const updateData = validate.schema_validate(updateMemberRoleSchema, req.body);

  const result = await projectMemberService.updateMemberRole({
    projectId: updateData.projectId,
    requesterId: req.user!.userId,
    memberId: updateData.memberId,
    newRole: updateData.newRole,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function removeMember(req: Request, res: Response) {
  const removeData = validate.schema_validate(removeMemberSchema, req.body);

  const result = await projectMemberService.removeMember(removeData.projectId, req.user!.userId, removeData.memberId);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getProjectMembers(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  const members = await projectMemberService.getProjectMembers(projectId, req.user!.userId);

  res.status(200).json({
    success: true,
    data: members,
  });
}

export async function getProjectStats(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  const stats = await projectMemberService.getProjectStats(projectId, req.user!.userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
}

export async function getUserInvitations(req: Request, res: Response) {
  const { email } = req.user!;

  const invitations = await projectMemberService.getUserInvitations(email);

  res.status(200).json({
    success: true,
    data: invitations,
  });
}

export async function cancelInvitation(req: Request, res: Response) {
  const cancelData = validate.schema_validate(cancelInvitationSchema, req.body);

  const result = await projectMemberService.cancelInvitation(
    cancelData.projectId,
    req.user!.userId,
    cancelData.invitationId,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function leaveProject(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  const result = await projectMemberService.removeMember(
    projectId,
    req.user!.userId,
    req.user!.userId, // Self-removal
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getInvitationDetails(req: Request, res: Response) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  const invitation = await projectMemberService.getInvitationDetails(token);

  res.status(200).json({
    success: true,
    data: invitation,
  });
}

// Handler để accept (authenticated)
export async function acceptInvitationWithToken(req: Request, res: Response) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  const result = await projectMemberService.acceptInvitation({
    token,
    userId: req.user!.userId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

// Handler để decline (authenticated)
export async function declineInvitationWithToken(req: Request, res: Response) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  const result = await projectMemberService.declineInvitation(token);

  res.status(200).json({
    success: true,
    data: result,
  });
}
