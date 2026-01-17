// src/services/project-column.service.ts
import projectColumnRepository from "@/repositories/project-column.repository";
import projectRepository from "@/repositories/project.repository";
import activityService from "@/services/activity.service";
import validationService from "@/services/validation.service";
import { ProjectColumn } from "@/models/project.model";
import { ProjectRole, ActivityAction } from "@/enums";
import { BadRequestError, NotFoundError, ConflictError } from "@/utils/errors";

interface CreateColumnData {
  projectId: string;
  name: string;
  description?: string;
  color?: string;
}

interface UpdateColumnData {
  name?: string;
  description?: string;
  color?: string;
}

interface ReorderColumnsData {
  columnOrders: Array<{
    columnId: string;
    order: number;
  }>;
}

interface MoveIssueData {
  issueId: string;
  fromColumnId: string;
  toColumnId: string;
}

class ProjectColumnService {
  async createColumn(data: CreateColumnData, currentUserId: string): Promise<ProjectColumn> {
    const { projectId, name, description, color } = data;

    await validationService.validateProjectMemberPermission(projectId, currentUserId, ["owner", "admin"]);

    const existingColumn = await projectColumnRepository.findByProjectAndName(projectId, name);
    if (existingColumn) {
      throw new ConflictError({ message: `Column with name "${name}" already exists in this project` });
    }

    const maxOrder = await projectColumnRepository.getMaxOrder(projectId);

    const columnData = {
      projectId,
      name: name.trim(),
      description: description?.trim(),
      color,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const column = await projectColumnRepository.create(columnData);

    // Log activity
    await activityService.log({
      projectId,
      issueId: "",
      userId: currentUserId,
      actionType: ActivityAction.COLUMN_CREATED,
      changes: [{ field: "name", newValue: column.name }],
    });

    return column;
  }

  async getProjectColumns(projectId: string, currentUserId: string): Promise<ProjectColumn[]> {
    await validationService.validateProjectMemberPermission(projectId, currentUserId);

    return await projectColumnRepository.findByProject(projectId);
  }

  async getProjectColumnsWithStats(
    projectId: string,
    currentUserId: string
  ): Promise<Array<ProjectColumn & { issueCount: number }>> {
    await validationService.validateProjectMemberPermission(projectId, currentUserId);

    return await projectColumnRepository.getColumnWithIssueCount(projectId);
  }

  async getColumnById(columnId: string, currentUserId: string): Promise<ProjectColumn> {
    const column = await projectColumnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError({ message: "Column not found" });
    }

    await validationService.validateProjectMemberPermission(column.projectId, currentUserId);

    return column;
  }

  async updateColumn(columnId: string, data: UpdateColumnData, currentUserId: string): Promise<ProjectColumn> {
    const { name, description, color } = data;

    const column = await projectColumnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Validate user has permission to edit
    await validationService.validateProjectMemberPermission(column.projectId, currentUserId, ["owner", "admin"]);

    // If updating name, check for conflicts
    if (name && name.trim() !== column.name) {
      const existingColumn = await projectColumnRepository.findByProjectAndName(column.projectId, name.trim());
      if (existingColumn && existingColumn.id !== columnId) {
        throw new ConflictError({ message: `Column with name "${name.trim()}" already exists in this project` });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (color !== undefined) updateData.color = color;

    const updatedColumn = await projectColumnRepository.update(columnId, updateData);
    if (!updatedColumn) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Log activity
    const changes = Object.keys(updateData).map((key) => ({
      field: key,
      oldValue: (column as any)[key],
      newValue: updateData[key],
    }));

    await activityService.log({
      projectId: column.projectId,
      issueId: "",
      userId: currentUserId,
      actionType: ActivityAction.COLUMN_UPDATED,
      changes,
    });

    return updatedColumn;
  }

  async reorderColumns(projectId: string, data: ReorderColumnsData, currentUserId: string): Promise<void> {
    const { columnOrders } = data;
    if (!Array.isArray(columnOrders) || columnOrders.length === 0) {
      throw new BadRequestError({ message: "columnOrders must be a non-empty array" });
    }
    for (const item of columnOrders) {
      if (typeof item.columnId !== "string" || item.columnId.trim() === "") {
        throw new BadRequestError({ message: `Invalid columnId: ${item.columnId}` });
      }
      if (typeof item.order !== "number" || isNaN(item.order) || item.order <= 0) {
        throw new BadRequestError({ message: `Invalid order value: ${item.order}` });
      }
    }
    await projectColumnRepository.reorderColumns(projectId, columnOrders);

    // Validate all columns belong to the project
    const projectColumns = await projectColumnRepository.findByProject(projectId);
    const projectColumnIds = new Set(projectColumns.map((col) => col.id));

    for (const { columnId } of columnOrders) {
      if (!projectColumnIds.has(columnId)) {
        throw new BadRequestError({ message: `Column ${columnId} does not belong to project ${projectId}` });
      }
    }

    // Validate order numbers are unique and sequential
    const orders = columnOrders.map((co) => co.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new BadRequestError({ message: "Order numbers must be sequential starting from 1" });
      }
    }

    await projectColumnRepository.reorderColumns(projectId, columnOrders);

    // Log activity
    await activityService.log({
      projectId,
      issueId: "",
      userId: currentUserId,
      actionType: ActivityAction.COLUMN_UPDATED,
      changes: [{ field: "order", newValue: "reordered" }],
    });
  }

  async deleteColumn(columnId: string, currentUserId: string): Promise<void> {
    const column = await projectColumnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Validate user has permission to delete
    await validationService.validateProjectMemberPermission(column.projectId, currentUserId, ["owner", "admin"]);

    // Check if column has issues
    if (column.issueIds && column.issueIds.length > 0) {
      throw new BadRequestError({
        message: `Cannot delete column "${column.name}" because it contains ${column.issueIds.length} issue(s). Please move or delete the issues first.`,
      });
    }

    const deleted = await projectColumnRepository.delete(columnId);
    if (!deleted) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Log activity
    await activityService.log({
      projectId: column.projectId,
      issueId: "",
      userId: currentUserId,
      actionType: ActivityAction.COLUMN_DELETED,
      changes: [{ field: "name", oldValue: column.name }],
    });
  }

  async addIssueToColumn(columnId: string, issueId: string, currentUserId: string): Promise<void> {
    const column = await projectColumnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Validate user has access
    await validationService.validateProjectMemberPermission(column.projectId, currentUserId, [
      "owner",
      "admin",
      "member",
    ]);

    await projectColumnRepository.addIssueToColumn(columnId, issueId);
  }

  async removeIssueFromColumn(columnId: string, issueId: string, currentUserId: string): Promise<void> {
    const column = await projectColumnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError({ message: "Column not found" });
    }

    // Validate user has access
    await validationService.validateProjectMemberPermission(column.projectId, currentUserId, [
      "owner",
      "admin",
      "member",
    ]);

    await projectColumnRepository.removeIssueFromColumn(columnId, issueId);
  }

  async initializeDefaultColumns(projectId: string, currentUserId: string): Promise<ProjectColumn[]> {
    // This method creates default columns when a project is created
    const defaultColumns = [
      { name: "To Do", description: "Tasks that need to be done", color: "#6B7280" },
      { name: "In Progress", description: "Tasks currently being worked on", color: "#3B82F6" },
      { name: "Review", description: "Tasks ready for review", color: "#F59E0B" },
      { name: "Done", description: "Completed tasks", color: "#10B981" },
    ];

    const createdColumns: ProjectColumn[] = [];

    for (let i = 0; i < defaultColumns.length; i++) {
      const defaultCol = defaultColumns[i];
      if (!defaultCol) continue;

      const columnData = {
        projectId,
        name: defaultCol.name,
        description: defaultCol.description,
        color: defaultCol.color,
        order: i + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const column = await projectColumnRepository.create(columnData);
      createdColumns.push(column);
    }

    return createdColumns;
  }
}

export default new ProjectColumnService();
