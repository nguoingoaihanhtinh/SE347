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
  const { userId } = req.user!;

  const invitations = await projectMemberService.getPendingInvitationsByUserId(userId);

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

// Direct add member (without invitation flow)
export async function addMemberDirect(req: Request, res: Response) {
  console.log("📧 [HANDLER] addMemberDirect called with params:", req.params, "body:", req.body);
  const { projectId } = req.params;
  const { userId } = req.body;
  const requesterId = req.user!.userId;
  console.log("📧 [HANDLER] projectId:", projectId, "userId:", userId, "requesterId:", requesterId);

  if (!projectId) {
    console.log("📧 [HANDLER] Missing projectId");
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  if (!userId) {
    console.log("📧 [HANDLER] Missing userId");
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    console.log("📧 [HANDLER] Calling service.addMemberDirect...");
    const result = await projectMemberService.addMemberDirect({
      projectId,
      requesterId,
      userId,
      role: "member", // Default role
    });
    console.log("📧 [HANDLER] Service returned:", result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("📧 [HANDLER] Error in addMemberDirect:", error);
    throw error;
  }
}

// Remove member (simplified endpoint)
export async function removeMemberDirect(req: Request, res: Response) {
  console.log("🗑️ [HANDLER] removeMemberDirect called with params:", req.params);
  const { projectId, userId } = req.params;
  const requesterId = req.user!.userId;
  console.log("🗑️ [HANDLER] projectId:", projectId, "userId:", userId, "requesterId:", requesterId);

  if (!projectId) {
    console.log("🗑️ [HANDLER] Missing projectId");
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  if (!userId) {
    console.log("🗑️ [HANDLER] Missing userId");
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    console.log("🗑️ [HANDLER] Calling service.removeMember...");
    const result = await projectMemberService.removeMember(projectId, requesterId, userId);
    console.log("🗑️ [HANDLER] Service returned:", result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("🗑️ [HANDLER] Error in removeMemberDirect:", error);
    throw error;
  }
}

// Request to join a private project by key
export async function requestToJoin(req: Request, res: Response) {
  console.log("🔔 [HANDLER] requestToJoin called with body:", req.body);
  const { projectKey } = req.body;
  const userId = req.user!.userId;
  console.log("🔔 [HANDLER] projectKey:", projectKey, "userId:", userId);

  if (!projectKey) {
    console.log("🔔 [HANDLER] Missing projectKey");
    return res.status(400).json({
      success: false,
      message: "Project key is required",
    });
  }

  try {
    console.log("🔔 [HANDLER] Calling service.requestToJoin...");
    const result = await projectMemberService.requestToJoin(projectKey, userId);
    console.log("🔔 [HANDLER] Service returned:", result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("🔔 [HANDLER] Error in requestToJoin:", error);
    throw error;
  }
}

// Update member status (accept/reject invite or request)
export async function updateMemberStatus(req: Request, res: Response) {
  const { projectId, userId } = req.params;
  const { status } = req.body;

  if (!projectId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Project ID and User ID are required",
    });
  }

  if (!status || !["active", "pending_invite", "pending_request"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Valid status is required (active, pending_invite, pending_request)",
    });
  }

  const result = await projectMemberService.updateMemberStatus(
    projectId,
    req.user!.userId,
    userId,
    status as "active" | "pending_invite" | "pending_request"
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.member,
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
