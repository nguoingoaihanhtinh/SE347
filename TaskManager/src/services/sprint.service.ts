import { NotFoundError, BadRequestError } from "@/utils/errors";
import sprintRepository from "@/repositories/sprint.repository";
import ValidationService from "@/services/validation.service";
import { Sprint } from "@/models/sprint.model";
import ActivityService from "@/services/activity.service";
import { ActivityAction } from "@/enums";

export class SprintService {
  async findAllByProject(projectId: string, page: number, limit: number) {
    return sprintRepository.findAllByProject(projectId, page, limit);
  }

  async findOneById(id: string) {
    const sprint = await sprintRepository.findOne({ id });
    if (!sprint) throw new NotFoundError({ message: "Sprint not found" });
    return sprint;
  }

  async create(data: Omit<Sprint, "id" | "createdAt" | "updatedAt" | "duration">, userId: string) {
    await ValidationService.validateSprintProject(data, userId);

    const sprint = await sprintRepository.create(data);

    await ActivityService.log({
      projectId: data.projectId,
      issueId: sprint.id,
      userId: userId,
      actionType: ActivityAction.SPRINT_CREATED,
    });

    return sprint;
  }

  async update(id: string, data: Partial<Sprint>, userId: string) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: "Sprint not found" });

    await ValidationService.validateProjectMemberPermission(existing.projectId, userId, ["owner", "admin"]);

    const updated = await sprintRepository.update(id, data);

    await ActivityService.log({
      projectId: existing.projectId,
      issueId: id,
      userId: userId,
      actionType: ActivityAction.SPRINT_UPDATED,
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const exists = await this.findOneById(id);
    if (!exists) throw new NotFoundError({ message: "Sprint not found" });

    await ValidationService.validateProjectMemberPermission(exists.projectId, userId, ["owner", "admin"]);

    const deleted = await sprintRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: "Failed to delete sprint" });

    await ActivityService.log({
      projectId: exists.projectId,
      issueId: id,
      userId: userId,
      actionType: ActivityAction.SPRINT_DELETED,
    });

    return true;
  }
}

export default new SprintService();
