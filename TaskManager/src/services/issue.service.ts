// src/services/issue.service.ts
import { NotFoundError, BadRequestError } from "@/utils/errors";
import IssueRepository from "@/repositories/issue.repository";
import ProjectService from "@/services/project.service";
import { Issue } from "@/models/issue.model";

type CreateIssueInput = Omit<Issue, "id" | "key" | "createdAt" | "updatedAt">;
type UpdateIssueInput = Partial<Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "projectId">>;

export class IssueService {
  async findAll(filters: { projectId?: string; columnId?: string }, page: number, limit: number) {
    return IssueRepository.findAll(filters, page, limit);
  }

  async findOneById(id: string) {
    const issue = await IssueRepository.findOne({ id });
    if (!issue) throw new NotFoundError({ message: `Issue not found` });
    return issue;
  }

  async create(data: CreateIssueInput) {
    const project = await ProjectService.findOneById(data.projectId);
    if (!project) throw new BadRequestError({ message: "Invalid projectId" });
    return IssueRepository.create(data, project.key);
  }

  async update(id: string, data: UpdateIssueInput) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: `Issue not found` });
    return IssueRepository.update(id, data);
  }

  async delete(id: string) {
    const exists = await this.findOneById(id);
    if (!exists) throw new NotFoundError({ message: `Issue not found` });
    const deleted = await IssueRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: `Failed to delete issue` });
    return true;
  }
}

export default new IssueService();
