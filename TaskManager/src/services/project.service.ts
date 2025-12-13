// services/project.service.ts
import { NotFoundError, BadRequestError } from "@/utils/errors";
import projectRepository from "@/repositories/project.repository";
import { Project } from "@/models/project.model";

export class ProjectService {
  async findAll(page: number = 1, limit: number = 10) {
    return projectRepository.findAll({}, page, limit);
  }

  async findOneById(id: string) {
    const project = await projectRepository.findOne({ id });
    if (!project) {
      throw new NotFoundError({ message: `Project with ID ${id} not found` });
    }
    return project;
  }

  async findOneByKey(key: string) {
    const project = await projectRepository.findOne({ key });
    if (!project) {
      throw new NotFoundError({ message: `Project with key ${key} not found` });
    }
    return project;
  }

  async create(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    // Optional: Validate key uniqueness
    const existing = await projectRepository.findOne({ key: projectData.key });
    if (existing) {
      throw new BadRequestError({ message: `Project key "${projectData.key}" already exists` });
    }

    return projectRepository.create(projectData);
  }

  async update(id: string, updateData: Partial<Project>) {
    const existing = await this.findOneById(id);
    if (!existing) {
      throw new NotFoundError({ message: `Project with ID ${id} not found` });
    }

    // Optional: Check key uniqueness if key is being updated
    if (updateData.key && updateData.key !== existing.key) {
      const dup = await projectRepository.findOne({ key: updateData.key });
      if (dup) {
        throw new BadRequestError({ message: `Project key "${updateData.key}" already exists` });
      }
    }

    const updated = await projectRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError({ message: `Failed to update project ${id}` });
    }
    return updated;
  }

  async delete(id: string) {
    const exists = await projectRepository.findOne({ id });
    if (!exists) {
      throw new NotFoundError({ message: `Project with ID ${id} not found` });
    }

    const deleted = await projectRepository.delete(id);
    if (!deleted) {
      throw new BadRequestError({ message: `Failed to delete project ${id}` });
    }
  }
}

export default new ProjectService();
