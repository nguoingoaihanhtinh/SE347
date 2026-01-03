import { NotFoundError, BadRequestError } from "@/utils/errors";
import IssueRepository from "@/repositories/issue.repository";
import ProjectService from "@/services/project.service";
import { Issue } from "@/models/issue.model";
import ActivityService from "@/services/activity.service";
import { ActivityAction } from "@/enums";

type CreateIssueInput = Omit<Issue, "id" | "key" | "createdAt" | "updatedAt">;
type UpdateIssueInput = Partial<Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "projectId">>;

export class IssueService {
  async findAll(filters: { projectId?: string; columnId?: string }, page: number, limit: number) {
    return IssueRepository.findAll(filters, page, limit);
  }

  async findOneById(id: string) {
    const issue = await IssueRepository.findOne({ id });
    if (!issue) throw new NotFoundError({ message: "Issue not found" });
    return issue;
  }

  async create(data: CreateIssueInput) {
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
      userId: data.reporterId,
      actionType: ActivityAction.ISSUE_CREATED,
    });

    return issue;
  }

  async update(id: string, data: UpdateIssueInput) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: "Issue not found" });

    const updated = await IssueRepository.update(id, data);

    await ActivityService.log({
      projectId: existing.projectId,
      issueId: id,
      userId: data.assigneeId || existing.assigneeId,
      actionType: ActivityAction.ISSUE_UPDATED,
    });

    return updated;
  }

  async delete(id: string) {
    const exists = await this.findOneById(id);
    if (!exists) throw new NotFoundError({ message: "Issue not found" });
    const deleted = await IssueRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: "Failed to delete issue" });

    await ActivityService.log({
      projectId: exists.projectId,
      issueId: id,
      userId: exists.assigneeId || exists.reporterId,
      actionType: ActivityAction.ISSUE_DELETED,
    });

    return true;
  }
}

export default new IssueService();
