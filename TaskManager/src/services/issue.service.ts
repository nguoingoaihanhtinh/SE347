import { NotFoundError, BadRequestError } from "@/utils/errors";
import IssueRepository from "@/repositories/issue.repository";
import ProjectService from "@/services/project.service";
import ValidationService from "@/services/validation.service";
import { Issue } from "@/models/issue.model";
import ActivityService from "@/services/activity.service";
import { ActivityAction } from "@/enums";
import sprintRepository from "@/repositories/sprint.repository";

type CreateIssueInput = Omit<Issue, "id" | "key" | "createdAt" | "updatedAt">;
type UpdateIssueInput = Partial<Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "projectId">>;

interface ChangeLog {
  field: string;
  old_value: string | null;
  new_value: string | null;
}

type UpdatableIssueField = keyof UpdateIssueInput;

export class IssueService {
  async findAll(filters: { projectId?: string; columnId?: string; assigneeId?: string }, page: number, limit: number) {
    return IssueRepository.findAll(filters, page, limit);
  }

  async findForBoard(projectId: string, page: number, limit: number) {
    // Determine project type to apply Scrum vs Kanban logic
    const project = await ProjectService.findOneById(projectId);
    if (!project) {
      throw new BadRequestError({ message: "Invalid projectId" });
    }

    const isScrum = project.type === "scrum";

    // Kanban: board shows all issues in the project
    if (!isScrum) {
      const result = await IssueRepository.findAll({ projectId }, page, limit);
      return {
        ...result,
        meta: {
          mode: "kanban",
          hasActiveSprint: true,
        },
      };
    }

    // Scrum: board shows only issues of the currently active sprint
    const now = new Date();
    const activeSprint = await sprintRepository.findActiveByProject(projectId, now);

    if (!activeSprint) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
        meta: {
          mode: "scrum",
          hasActiveSprint: false,
        },
      };
    }

    const result = await IssueRepository.findAll(
      { projectId, sprintId: activeSprint.id },
      page,
      limit,
    );

    return {
      ...result,
      meta: {
        mode: "scrum",
        hasActiveSprint: true,
        activeSprintId: activeSprint.id,
        activeSprintName: activeSprint.name,
      },
    };
  }

  async findOneById(id: string) {
    const issue = await IssueRepository.findOne({ id });
    if (!issue) throw new NotFoundError({ message: "Issue not found" });
    return issue;
  }

  async create(data: CreateIssueInput, currentUserId: string) {
    await ValidationService.validateIssueData(
      {
        projectId: data.projectId,
        sprintId: data.sprintId,
        reporterId: data.reporterId,
        assigneeId: data.assigneeId,
      },
      currentUserId,
    );
    const project = await ProjectService.findOneById(data.projectId);
    if (!project) throw new BadRequestError({ message: "Invalid projectId" });

    const finalData = { ...data };
    if (!finalData.assigneeId) {
      finalData.assigneeId = finalData.reporterId;
    }

    const issue = await IssueRepository.create(finalData, project.key);

    await ActivityService.log({
      projectId: data.projectId,
      issueId: issue.id,
      userId: currentUserId,
      actionType: ActivityAction.ISSUE_CREATED,
    });

    return issue;
  }

  async update(id: string, data: UpdateIssueInput, currentUserId: string) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: "Issue not found" });

    await ValidationService.validateProjectMemberPermission(existing.projectId, currentUserId);

    if (data.sprintId !== undefined) {
      await ValidationService.validateIssueSprintRelation(existing.projectId, data.sprintId);
    }

    if (data.assigneeId !== undefined) {
      await ValidationService.validateIssueAssignee(existing.projectId, data.assigneeId);
    }

    const changes = this.calculateChanges(existing, data);

    const updated = await IssueRepository.update(id, data);

    await ActivityService.log({
      projectId: existing.projectId,
      issueId: id,
      userId: currentUserId,
      actionType: ActivityAction.ISSUE_UPDATED,
      changes,
    });

    return updated;
  }

  private calculateChanges(existing: Issue, updateData: UpdateIssueInput): ChangeLog[] {
    const changes: ChangeLog[] = [];

    const fieldsToTrack: UpdatableIssueField[] = [
      "title",
      "summary",
      "description",
      "priority",
      "type",

      "sprintId",
      "columnId",
      "assigneeId",
      "storyPoint",
      "dueDateFrom",
      "dueDateTo",
    ];

    fieldsToTrack.forEach((field) => {
      const oldRaw = existing[field];
      const newRaw = updateData[field];

      if (newRaw === undefined) {
        console.log(`Field ${field}: skipped (undefined in updateData)`);
        return;
      }

      let oldNormalized = oldRaw != null ? String(oldRaw) : null;
      let newNormalized = newRaw != null ? String(newRaw) : null;

      if (oldNormalized !== newNormalized) {
        changes.push({
          field,
          old_value: oldNormalized,
          new_value: newNormalized,
        });
      }
    });

    return changes;
  }

  async delete(id: string, currentUserId: string) {
    const exists = await this.findOneById(id);
    if (!exists) throw new NotFoundError({ message: "Issue not found" });

    await ValidationService.validateProjectMemberPermission(exists.projectId, currentUserId, [
      "owner",
      "admin",
      "member",
    ]);

    const deleted = await IssueRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: "Failed to delete issue" });

    await ActivityService.log({
      projectId: exists.projectId,
      issueId: id,
      userId: currentUserId,
      actionType: ActivityAction.ISSUE_DELETED,
    });

    return true;
  }
}

export default new IssueService();
