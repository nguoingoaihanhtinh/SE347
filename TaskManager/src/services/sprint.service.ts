import { NotFoundError, BadRequestError } from "@/utils/errors";
import sprintRepository from "@/repositories/sprint.repository";
import { Sprint } from "@/models/sprint.model";

export class SprintService {
  async findAllByProject(projectId: string, page: number, limit: number) {
    return sprintRepository.findAllByProject(projectId, page, limit);
  }

  async findOneById(id: string) {
    const sprint = await sprintRepository.findOne({ id });
    if (!sprint) throw new NotFoundError({ message: `Sprint not found` });
    return sprint;
  }

  async create(data: Omit<Sprint, "id" | "createdAt" | "updatedAt" | "duration">) {
    // Optional: validate project exists (gọi ProjectService)
    return sprintRepository.create(data);
  }

  async update(id: string, data: Partial<Sprint>) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: `Sprint not found` });
    return sprintRepository.update(id, data);
  }

  async delete(id: string) {
    const exists = await this.findOneById(id);
    if (!exists) throw new NotFoundError({ message: `Sprint not found` });
    const deleted = await sprintRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: `Failed to delete sprint` });
    return true;
  }
}

export default new SprintService();
