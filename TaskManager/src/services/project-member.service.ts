import crypto from "crypto";
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError } from "@/utils/errors";
import {
  TeamMemberRole,
  ProjectInvitation,
  ProjectMemberWithDetails,
  ProjectMemberStats,
} from "@/models/project-member.model";
import { MemberStatus } from "@/models/project.model";
import projectInvitationRepository from "@/repositories/project-invitation.repository";
import projectMemberRepository from "@/repositories/project-member.repository";
import projectRepository from "@/repositories/project.repository";
import userRepository from "@/repositories/user.repository";
import emailService from "@/services/email.service";
import { env } from "@/config/env";
import logger from "@/utils/logger";
import { ObjectId } from "mongodb";

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
        return requesterLevel > targetLevel;
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
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invitation = await projectInvitationRepository.create({
        projectId: new ObjectId(projectId),
        inviterUserId: new ObjectId(inviterUserId),
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
        await projectInvitationRepository.deleteById(invitation.id!);
        throw new BadRequestError({ message: "Failed to send invitation email" });
      }

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
      if (!invitation) throw new NotFoundError({ message: "Invalid or expired invitation" });
      if (invitation.status !== "pending") {
        throw new BadRequestError({ message: "Invitation has already been processed" });
      }
      if (invitation.expiresAt < new Date()) {
        await projectInvitationRepository.updateStatus(invitation.id!, "expired");
        throw new BadRequestError({ message: "Invitation has expired" });
      }

      const user = await userRepository.findOne({ userId });
      if (!user) throw new NotFoundError({ message: "User not found" });
      if (user.email !== invitation.inviteeEmail) {
        throw new BadRequestError({
          message: "Email mismatch. This invitation was sent to a different email address",
        });
      }

      const projectIdStr = invitation.projectId.toString();
      const existingMember = await projectMemberRepository.findByProjectAndUser(projectIdStr, userId);
      if (existingMember) {
        await projectInvitationRepository.updateStatus(invitation.id!, "accepted");
        throw new BadRequestError({ message: "You are already a member of this project" });
      }

      const member = await projectMemberRepository.create({
        projectId: projectIdStr,
        userId,
        teamIds: [],
        role: invitation.role,
        isPending: false,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await projectInvitationRepository.updateStatus(invitation.id!, "accepted");

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(projectIdStr);
      const newMember = memberWithDetails.find((m) => m.userId === userId);

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
      if (!invitation) throw new NotFoundError({ message: "Invalid or expired invitation" });
      if (invitation.status !== "pending") {
        throw new BadRequestError({ message: "Invitation has already been processed" });
      }

      await projectInvitationRepository.updateStatus(invitation.id!, "declined");

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
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      if (!requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      const targetMember = await projectMemberRepository.findByProjectAndUser(projectId, memberId);
      if (!targetMember) {
        throw new NotFoundError({ message: "Member not found in this project" });
      }

      if (!this.hasPermission(requester.role as TeamMemberRole, targetMember.role as TeamMemberRole, "update")) {
        throw new UnauthorizedError({ message: "Insufficient permissions to update this member's role" });
      }

      if (targetMember.role === "owner" && newRole !== "owner") {
        const ownerCount = await projectMemberRepository.countByRole(projectId, "owner");
        if (ownerCount <= 1) {
          throw new BadRequestError({ message: "Cannot change role of the last project owner" });
        }
      }

      const updatedMember = await projectMemberRepository.updateRole(projectId, memberId, newRole);
      if (!updatedMember) {
        throw new NotFoundError({ message: "Failed to update member role" });
      }

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(projectId);
      const member = memberWithDetails.find((m) => m.userId === memberId);

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
      const project = await projectRepository.findOne({ id: projectId });
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }

      // Check if requester is project owner OR a member
      const isOwner = project.ownerId.toString() === requesterId.toString();
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      
      if (!isOwner && !requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      const targetMember = await projectMemberRepository.findByProjectAndUser(projectId, memberId);
      if (!targetMember) {
        throw new NotFoundError({ message: "Member not found in this project" });
      }

      // Owner can always remove members, or check permission for non-owners
      if (
        !isOwner &&
        memberId !== requesterId &&
        (!requester || !this.hasPermission(requester.role as TeamMemberRole, targetMember.role as TeamMemberRole, "remove"))
      ) {
        throw new UnauthorizedError({ message: "Insufficient permissions to remove this member" });
      }

      if (targetMember.role === "owner") {
        const ownerCount = await projectMemberRepository.countByRole(projectId, "owner");
        if (ownerCount <= 1) {
          throw new BadRequestError({ message: "Cannot remove the last project owner" });
        }
      }

      console.log("🗑️ [SERVICE] Calling repository.remove with projectId:", projectId, "memberId:", memberId);
      const removed = await projectMemberRepository.remove(projectId, memberId);
      console.log("🗑️ [SERVICE] Remove result:", removed ? "Success" : "Failed");
      if (!removed) {
        throw new NotFoundError({ message: "Failed to remove member" });
      }

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
    // Check if user is a project member OR the project owner
    const project = await projectRepository.findOne({ id: projectId });
    if (!project) {
      throw new NotFoundError({ message: "Project not found" });
    }

    const isOwner = project.ownerId.toString() === requesterId.toString();
    const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
    
    // Allow access if user is owner OR a member
    if (!isOwner && !requester) {
      throw new UnauthorizedError({ message: "You are not a member of this project" });
    }

    const members = await projectMemberRepository.findByProjectWithUserDetails(projectId);
    console.log("👥 Getting project members for projectId:", projectId, "Found:", members.length);
    console.log("👥 Members with status:", members.map(m => ({ userId: m.userId, status: m.status })));
    return members;
  }

  async getProjectStats(projectId: string, requesterId: string): Promise<ProjectMemberStats> {
    const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
    if (!requester) {
      throw new UnauthorizedError({ message: "You are not a member of this project" });
    }

    const stats = await projectMemberRepository.getProjectStats(projectId);
    stats.pendingInvitations = await projectInvitationRepository.countPendingByProject(projectId);

    return stats;
  }

  async getUserInvitations(email: string): Promise<ProjectInvitation[]> {
    return projectInvitationRepository.findByEmail(email);
  }

  async getPendingInvitationsByUserId(userId: string): Promise<ProjectMemberWithDetails[]> {
    console.log("📧 Getting pending invitations for userId:", userId);
    const invitations = await projectMemberRepository.findPendingInvitationsByUser(userId);
    console.log("📧 Found invitations:", invitations.length);
    return invitations;
  }

  async cancelInvitation(
    projectId: string,
    requesterId: string,
    invitationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      if (!requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      if (!this.hasPermission(requester.role as TeamMemberRole, "member", "invite")) {
        throw new UnauthorizedError({ message: "Insufficient permissions to cancel invitations" });
      }

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

  async addMemberDirect(input: {
    projectId: string;
    requesterId: string;
    userId: string;
    role?: TeamMemberRole;
  }): Promise<{ success: boolean; message: string; member?: ProjectMemberWithDetails }> {
    const { projectId, requesterId, userId, role = "member" } = input;

    try {
      const project = await projectRepository.findOne({ id: projectId });
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }

      // Check if requester is project owner OR a member with owner role
      const isOwner = project.ownerId.toString() === requesterId.toString();
      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      
      if (!isOwner && !requester) {
        throw new UnauthorizedError({ message: "You are not a member of this project" });
      }

      // Only owner can directly add members (owner can be project owner even if not in members list)
      if (!isOwner && (!requester || requester.role !== "owner")) {
        throw new UnauthorizedError({ message: "Only project owners can directly add members" });
      }

      // Check if user exists
      const user = await userRepository.findOne({ userId });
      if (!user) {
        throw new NotFoundError({ message: "User not found" });
      }

      // Check if user is the project owner
      if (project.ownerId.toString() === userId.toString()) {
        throw new ConflictError({ message: "User is already the project owner" });
      }

      // Check if user is already a member
      const existingMember = await projectMemberRepository.findByProjectAndUser(projectId, userId);
      if (existingMember) {
        console.log("📧 Existing member found:", existingMember);
        if (existingMember.status === "active") {
          throw new ConflictError({ message: "User is already a member of this project" });
        }
        // If already exists with pending status, update to pending_invite
        console.log("📧 Updating existing member status to pending_invite");
        await projectMemberRepository.updateStatus(projectId, userId, "pending_invite");
      } else {
        // Create pending invitation - use try-catch to handle race condition
        console.log("📧 Creating new invitation with status: pending_invite");
        try {
          const newMember = await projectMemberRepository.create({
            projectId,
            userId,
            teamIds: [],
            role,
            isPending: true,
            status: "pending_invite",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log("📧 Created invitation:", newMember);
        } catch (error: any) {
          // Handle duplicate key error (race condition)
          if (error.code === 11000 || error.message?.includes("duplicate key")) {
            console.log("📧 Duplicate key error, updating status instead");
            // Member was created by another request, just update status
            await projectMemberRepository.updateStatus(projectId, userId, "pending_invite");
          } else {
            throw error;
          }
        }
      }

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(projectId);
      const newMember = memberWithDetails.find((m) => m.userId === userId);

      return {
        success: true,
        message: "Member added successfully",
        member: newMember,
      };
    } catch (error) {
      logger.error("Error adding member directly:", error);
      throw error;
    }
  }

  async requestToJoin(projectKey: string, userId: string): Promise<{ success: boolean; message: string; member?: ProjectMemberWithDetails }> {
    console.log("🔔 [SERVICE] requestToJoin called - projectKey:", projectKey, "userId:", userId);
    try {
      // Find project by key
      console.log("🔔 [SERVICE] Finding project by key:", projectKey);
      const project = await projectRepository.findOne({ key: projectKey });
      console.log("🔔 [SERVICE] Project found:", project ? { id: project.id, name: project.name, access: project.access } : "NOT FOUND");
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }

      // Check if project is private (only private projects can be joined via key)
      if (project.access !== "private") {
        console.log("🔔 [SERVICE] Project is not private, access:", project.access);
        throw new BadRequestError({ message: "Public projects cannot be joined via key. Please contact the project owner." });
      }
      console.log("🔔 [SERVICE] Project is private, proceeding...");

      // Check if user is already a member
      const existingMember = await projectMemberRepository.findByProjectAndUser(project.id!, userId);
      if (existingMember) {
        console.log("🔔 Existing member found for request:", existingMember);
        if (existingMember.status === "active") {
          throw new BadRequestError({ message: "You are already a member of this project" });
        }
        // If already exists (pending_invite or pending_request), update to pending_request
        console.log("🔔 Updating existing member status to pending_request");
        await projectMemberRepository.updateStatus(project.id!, userId, "pending_request");
      } else {
        // Create pending request - use try-catch to handle race condition
        console.log("🔔 Creating new request with status: pending_request");
        try {
          const newMember = await projectMemberRepository.create({
            projectId: project.id!,
            userId,
            teamIds: [],
            role: "member",
            isPending: true,
            status: "pending_request",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log("🔔 Created request:", newMember);
        } catch (error: any) {
          // Handle duplicate key error (race condition)
          if (error.code === 11000 || error.message?.includes("duplicate key")) {
            console.log("🔔 Duplicate key error, updating status instead");
            // Member was created by another request, just update status
            await projectMemberRepository.updateStatus(project.id!, userId, "pending_request");
          } else {
            throw error;
          }
        }
      }

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(project.id!);
      const newMember = memberWithDetails.find((m) => m.userId === userId);

      return {
        success: true,
        message: "Join request sent successfully",
        member: newMember,
      };
    } catch (error) {
      logger.error("Error requesting to join:", error);
      throw error;
    }
  }

  async updateMemberStatus(
    projectId: string,
    requesterId: string,
    userId: string,
    newStatus: MemberStatus
  ): Promise<{ success: boolean; message: string; member?: ProjectMemberWithDetails }> {
    try {
      const project = await projectRepository.findOne({ id: projectId });
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }

      const requester = await projectMemberRepository.findByProjectAndUser(projectId, requesterId);
      const isOwner = project.ownerId.toString() === requesterId.toString();

      const targetMember = await projectMemberRepository.findByProjectAndUser(projectId, userId);
      if (!targetMember) {
        throw new NotFoundError({ message: "Member not found in this project" });
      }

      // Allow user to accept/decline their own invitation or request
      const isAcceptingOwnInvitation = requesterId.toString() === userId.toString();
      
      if (isAcceptingOwnInvitation) {
        // User can only accept/decline their own pending invitation or request
        if (targetMember.status !== "pending_invite" && targetMember.status !== "pending_request") {
          throw new BadRequestError({ message: "You can only accept pending invitations or requests" });
        }
        // Allow user to accept (set to active) or decline (remove)
        if (newStatus !== "active") {
          throw new BadRequestError({ message: "You can only accept invitations, not change status to other values" });
        }
      } else {
        // Only owner or admin can accept/reject requests for other users
        if (!isOwner && (!requester || (requester.role !== "owner" && requester.role !== "admin"))) {
          throw new UnauthorizedError({ message: "Only project owners and admins can manage member status" });
        }
      }

      // Update status
      await projectMemberRepository.updateStatus(projectId, userId, newStatus);

      const memberWithDetails = await projectMemberRepository.findByProjectWithUserDetails(projectId);
      const updatedMember = memberWithDetails.find((m) => m.userId === userId);

      return {
        success: true,
        message: newStatus === "active" ? "Member request accepted" : "Member request rejected",
        member: updatedMember,
      };
    } catch (error) {
      logger.error("Error updating member status:", error);
      throw error;
    }
  }
}

export default new ProjectMemberService();
