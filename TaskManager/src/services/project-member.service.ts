// src/services/project-member.service.ts
import crypto from "crypto";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/utils/errors";
import {
  TeamMemberRole,
  ProjectInvitation,
  ProjectMemberWithDetails,
  ProjectMemberStats,
} from "@/models/project-member.model";
import projectInvitationRepository from "@/repositories/project-invitation.repository";
import projectMemberRepository from "@/repositories/project-member.repository";
import projectRepository from "@/repositories/project.repository";
import userRepository from "@/repositories/user.repository";
import emailService from "@/services/email.service";
import { env } from "@/config/env";
import logger from "@/utils/logger";

export interface InviteMemberInput {
  projectId: string;
  inviterUserId: string;
  inviteeEmail: string;
  role: TeamMemberRole;
}

export interface UpdateMemberRoleInput {
  projectId: string;
  requesterId: string;
  memberId: string;
  newRole: TeamMemberRole;
}

export interface AcceptInvitationInput {
  token: string;
  userId: string;
}

class ProjectMemberService {
  // Role hierarchy for permission checks
  private readonly roleHierarchy: Record<TeamMemberRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  private hasPermission(
    requesterRole: TeamMemberRole,
    targetRole: TeamMemberRole,
    action: "invite" | "remove" | "update"
  ): boolean {
    const requesterLevel = this.roleHierarchy[requesterRole];
    const targetLevel = this.roleHierarchy[targetRole];

    switch (action) {
      case "invite":
        return requesterLevel >= 3 && requesterLevel >= targetLevel;
      case "remove":
        if (requesterRole === "owner") return targetRole !== "owner";
        return requesterLevel > targetLevel;
      case "update":
        if (requesterRole === "owner") return true;
        return requesterLevel > targetLevel && requesterLevel >= this.roleHierarchy[targetRole];
      default:
        return false;
    }
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async inviteMember(
    input: InviteMemberInput
  ): Promise<{ success: boolean; message: string; invitation?: ProjectInvitation }> {
    const { projectId, inviterUserId, inviteeEmail, role } = input;

    try {
      const project = await projectRepository.findOne({ id: projectId });
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }

      const inviterMember = await projectMemberRepository.findByProjectAndUser(projectId, inviterUserId);
      if (!inviterMember) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      if (!this.hasPermission(inviterMember.role as TeamMemberRole, role, "invite")) {
        throw new UnauthorizedError({ message: "Insufficient permissions to invite users with this role" });
      }

      const existingUser = await userRepository.findOne({ email: inviteeEmail });
      if (existingUser) {
        const existingMember = await projectMemberRepository.findByProjectAndUser(
          projectId,
          existingUser._id?.toString() || ""
        );
        if (existingMember) {
          throw new BadRequestError({ message: "User is already a member of this project" });
        }
      }

      const existingInvitation = await projectInvitationRepository.findPendingByProjectAndEmail(
        projectId,
        inviteeEmail
      );
      if (existingInvitation) {
        throw new BadRequestError({ message: "User already has a pending invitation for this project" });
      }

      const inviter = await userRepository.findOne({ userId: inviterUserId });
      if (!inviter) {
        throw new NotFoundError({ message: "Inviter not found" });
      }

      const token = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      const invitation = await projectInvitationRepository.create({
        projectId,
        inviterUserId,
        inviteeEmail,
        role,
        token,
        expiresAt,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const invitationLink = `${env.FRONTEND_URL}/accept-invitation?token=${token}`;
      const emailSent = await emailService.sendProjectInvitationEmail(
        inviteeEmail,
        `${inviter.firstName} ${inviter.lastName}`,
        project.name,
        role,
        invitationLink
      );

      if (!emailSent) {
        await projectInvitationRepository.deleteById(invitation.id || "");
        throw new BadRequestError({ message: "Failed to send invitation email" });
      }

      logger.info(`Project invitation sent: ${inviteeEmail} to project ${projectId} by ${inviterUserId}`);

      return {
        success: true,
        message: "Invitation sent successfully",
        invitation,
      };
    } catch (error) {
      logger.error("Error inviting member:", error);
      throw error;
    }
  }

  async acceptInvitation(
    input: AcceptInvitationInput
  ): Promise<{ success: boolean; message: string; member?: ProjectMemberWithDetails }> {
    const { token, userId } = input;

    try {
      const invitation = await projectInvitationRepository.findByToken(token);
      if (!invitation) {
        throw new NotFoundError({ message: "Invalid or expired invitation" });
      }

      if (invitation.status !== "pending") {
        throw new BadRequestError({ message: "Invitation has already been processed" });
      }

      if (invitation.expiresAt < new Date()) {
        await projectInvitationRepository.updateStatus(invitation.id || "", "expired");
        throw new BadRequestError({ message: "Invitation has expired" });
      }

      const user = await userRepository.findOne({ userId: userId });
      if (!user) {
        throw new NotFoundError({ message: "User not found" });
      }

      if (user.email !== invitation.inviteeEmail) {
        throw new BadRequestError({ message: "Email mismatch. This invitation was sent to a different email address" });
      }

      const existingMember = await projectMemberRepository.findByProjectAndUser(invitation.projectId, userId);
      if (existingMember) {
        await projectInvitationRepository.updateStatus(invitation.id || "", "accepted");
        throw new BadRequestError({ message: "You are already a member of this project" });
      }

      const member = await projectMemberRepository.create({
        projectId: invitation.projectId,
        userId,
        teamIds: [],
        role: invitation.role,
        isPending: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await projectInvitationRepository.updateStatus(invitation.id || "", "accepted");

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(invitation.projectId);
      const newMember = memberWithDetails.find((m) => m.userId === userId);

      logger.info(`Project invitation accepted: ${userId} joined project ${invitation.projectId}`);

      return {
        success: true,
        message: "Successfully joined the project",
        member: newMember,
      };
    } catch (error) {
      logger.error("Error accepting invitation:", error);
      throw error;
    }
  }

  async declineInvitation(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const invitation = await projectInvitationRepository.findByToken(token);
      if (!invitation) {
        throw new NotFoundError({ message: "Invalid or expired invitation" });
      }

      if (invitation.status !== "pending") {
        throw new BadRequestError({ message: "Invitation has already been processed" });
      }

      await projectInvitationRepository.updateStatus(invitation.id || "", "declined");

      return {
        success: true,
        message: "Invitation declined",
      };
    } catch (error) {
      logger.error("Error declining invitation:", error);
      throw error;
    }
  }

  async updateMemberRole(
    input: UpdateMemberRoleInput
  ): Promise<{ success: boolean; message: string; member?: ProjectMemberWithDetails }> {
    const { projectId, requesterId, memberId, newRole } = input;

    try {
      // Check requester permissions
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      if (!requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      // Get target member
      const targetMember = await projectMemberRepository.findByProjectAndUser(projectId, memberId);
      if (!targetMember) {
        throw new NotFoundError({ message: "Member not found in this project" });
      }

      // Check permissions
      if (!this.hasPermission(requester.role as TeamMemberRole, targetMember.role as TeamMemberRole, "update")) {
        throw new UnauthorizedError({ message: "Insufficient permissions to update this member's role" });
      }

      // Prevent removing the last owner
      if (targetMember.role === "owner" && newRole !== "owner") {
        const ownerCount = await projectMemberRepository.countByRole(projectId, "owner");
        if (ownerCount <= 1) {
          throw new BadRequestError({ message: "Cannot change role of the last project owner" });
        }
      }

      // Update role
      const updatedMember = await projectMemberRepository.updateRole(projectId, memberId, newRole);
      if (!updatedMember) {
        throw new NotFoundError({ message: "Failed to update member role" });
      }

      // Get updated member with details
      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(projectId);
      const member = memberWithDetails.find((m) => m.userId === memberId);

      logger.info(`Member role updated: ${memberId} in project ${projectId} to ${newRole} by ${requesterId}`);

      return {
        success: true,
        message: "Member role updated successfully",
        member,
      };
    } catch (error) {
      logger.error("Error updating member role:", error);
      throw error;
    }
  }

  async removeMember(
    projectId: string,
    requesterId: string,
    memberId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check requester permissions
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      if (!requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      // Get target member
      const targetMember = await projectMemberRepository.findByProjectAndUser(projectId, memberId);
      if (!targetMember) {
        throw new NotFoundError({ message: "Member not found in this project" });
      }

      // Check permissions (members can leave themselves)
      if (
        memberId !== requesterId &&
        !this.hasPermission(requester.role as TeamMemberRole, targetMember.role as TeamMemberRole, "remove")
      ) {
        throw new UnauthorizedError({ message: "Insufficient permissions to remove this member" });
      }

      // Prevent removing the last owner
      if (targetMember.role === "owner") {
        const ownerCount = await projectMemberRepository.countByRole(projectId, "owner");
        if (ownerCount <= 1) {
          throw new BadRequestError({ message: "Cannot remove the last project owner" });
        }
      }

      // Remove member
      const removed = await projectMemberRepository.remove(projectId, memberId);
      if (!removed) {
        throw new NotFoundError({ message: "Failed to remove member" });
      }

      logger.info(`Member removed: ${memberId} from project ${projectId} by ${requesterId}`);

      return {
        success: true,
        message: memberId === requesterId ? "Successfully left the project" : "Member removed successfully",
      };
    } catch (error) {
      logger.error("Error removing member:", error);
      throw error;
    }
  }

  async getProjectMembers(projectId: string, requesterId: string): Promise<ProjectMemberWithDetails[]> {
    // Check if requester is a member
    const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
    if (!requester) {
      throw new UnauthorizedError({ message: "You are not a member of this project" });
    }

    return projectMemberRepository.findByProjectWithUserDetails(projectId);
  }

  async getProjectStats(projectId: string, requesterId: string): Promise<ProjectMemberStats> {
    // Check if requester is a member
    const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
    if (!requester) {
      throw new UnauthorizedError({ message: "You are not a member of this project" });
    }

    const stats = await projectMemberRepository.getProjectStats(projectId);

    // Add pending invitations count
    stats.pendingInvitations = await projectInvitationRepository.countPendingByProject(projectId);

    return stats;
  }

  async getUserInvitations(email: string): Promise<ProjectInvitation[]> {
    return projectInvitationRepository.findByEmail(email);
  }

  async cancelInvitation(
    projectId: string,
    requesterId: string,
    invitationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check requester permissions
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      if (!requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      if (!this.hasPermission(requester.role as TeamMemberRole, "member", "invite")) {
        throw new UnauthorizedError({ message: "Insufficient permissions to cancel invitations" });
      }

      // Delete invitation
      const deleted = await projectInvitationRepository.deleteById(invitationId);
      if (!deleted) {
        throw new NotFoundError({ message: "Invitation not found" });
      }

      return {
        success: true,
        message: "Invitation cancelled successfully",
      };
    } catch (error) {
      logger.error("Error cancelling invitation:", error);
      throw error;
    }
  }
}

export default new ProjectMemberService();
