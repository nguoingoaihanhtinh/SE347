// src/services/validation.service.ts
import { BadRequestError, NotFoundError } from "@/utils/errors";
import projectRepository from "@/repositories/project.repository";
import sprintRepository from "@/repositories/sprint.repository";
import projectMemberRepository from "@/repositories/project-member.repository";
import logger from "@/utils/logger";

class ValidationService {
  /**
   * Validate that sprint belongs to the same project as the issue
   */
  async validateIssueSprintRelation(projectId: string, sprintId?: string): Promise<void> {
    if (!sprintId) return; // Sprint is optional

    try {
      const sprint = await sprintRepository.findOne({ id: sprintId });
      if (!sprint) {
        throw new NotFoundError({ message: "Sprint not found" });
      }

      if (sprint.projectId !== projectId) {
        throw new BadRequestError({
          message: "Sprint does not belong to the specified project",
        });
      }
    } catch (error) {
      logger.error("Sprint validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate that assignee is a member of the project
   */
  async validateIssueAssignee(projectId: string, assigneeId?: string): Promise<void> {
    if (!assigneeId) return; // Assignee is optional

    try {
      const isMember = await projectMemberRepository.isUserProjectMember(projectId, assigneeId);
      if (!isMember) {
        throw new BadRequestError({
          message: "Assignee must be a member of the project",
        });
      }
    } catch (error) {
      logger.error("Assignee validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate that reporter is a member of the project
   */
  async validateIssueReporter(projectId: string, reporterId: string): Promise<void> {
    try {
      const isMember = await projectMemberRepository.isUserProjectMember(projectId, reporterId);
      if (!isMember) {
        throw new BadRequestError({
          message: "Reporter must be a member of the project",
        });
      }
    } catch (error) {
      logger.error("Reporter validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate project exists and is accessible
   */
  async validateProjectExists(projectId: string): Promise<void> {
    try {
      const project = await projectRepository.findOne({ id: projectId });
      if (!project) {
        throw new NotFoundError({ message: "Project not found" });
      }
    } catch (error) {
      logger.error("Project validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate that user has permission to perform action on project
   */
  async validateProjectMemberPermission(
    projectId: string,
    userId: string,
    requiredRoles: string[] = ["owner", "admin", "member"]
  ): Promise<void> {
    try {
      const member = await projectMemberRepository.findByProjectAndUser(projectId, userId);
      if (!member) {
        throw new BadRequestError({
          message: "You are not a member of this project",
        });
      }

      if (!requiredRoles.includes(member.role as string)) {
        throw new BadRequestError({
          message: `Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`,
        });
      }
    } catch (error) {
      logger.error("Permission validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate complete issue data integrity
   */
  async validateIssueData(
    issueData: {
      projectId: string;
      sprintId?: string;
      reporterId: string;
      assigneeId?: string;
    },
    currentUserId: string
  ): Promise<void> {
    // Validate project exists
    await this.validateProjectExists(issueData.projectId);

    // Validate current user has permission
    await this.validateProjectMemberPermission(issueData.projectId, currentUserId);

    // Validate sprint belongs to project
    await this.validateIssueSprintRelation(issueData.projectId, issueData.sprintId);

    // Validate reporter is project member
    await this.validateIssueReporter(issueData.projectId, issueData.reporterId);

    // Validate assignee is project member
    await this.validateIssueAssignee(issueData.projectId, issueData.assigneeId);
  }

  /**
   * Validate sprint belongs to project
   */
  async validateSprintProject(sprintData: { projectId: string }, currentUserId: string): Promise<void> {
    // Validate project exists
    await this.validateProjectExists(sprintData.projectId);

    // Validate current user has permission to create sprints (admin or owner)
    await this.validateProjectMemberPermission(sprintData.projectId, currentUserId, ["owner", "admin"]);
  }
}

export default new ValidationService();
