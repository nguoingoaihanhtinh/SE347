// src/handlers/project-column.handler.ts
import { Request, Response } from "express";
import projectColumnService from "@/services/project-column.service";
import { BadRequestError, NotFoundError } from "@/utils/errors";

class ProjectColumnHandler {
  async createColumn(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { name, description, color } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        throw new BadRequestError({ message: "User not authenticated" });
      }

      if (!projectId) {
        throw new BadRequestError({ message: "Project ID is required" });
      }

      if (!name?.trim()) {
        throw new BadRequestError({ message: "Column name is required" });
      }

      const column = await projectColumnService.createColumn(
        {
          projectId,
          name: name.trim(),
          description,
          color,
        },
        currentUserId
      );

      res.status(201).json({
        success: true,
        message: "Column created successfully",
        data: column,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjectColumns(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { withStats } = req.query;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !projectId) {
        throw new BadRequestError({ message: "User not authenticated or project ID missing" });
      }

      let columns;
      if (withStats === "true") {
        columns = await projectColumnService.getProjectColumnsWithStats(projectId, currentUserId);
      } else {
        columns = await projectColumnService.getProjectColumns(projectId, currentUserId);
      }

      res.status(200).json({
        success: true,
        message: "Columns retrieved successfully",
        data: columns,
      });
    } catch (error) {
      throw error;
    }
  }

  async getColumnById(req: Request, res: Response): Promise<void> {
    try {
      const { columnId } = req.params;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !columnId) {
        throw new BadRequestError({ message: "User not authenticated or column ID missing" });
      }

      const column = await projectColumnService.getColumnById(columnId, currentUserId);

      res.status(200).json({
        success: true,
        message: "Column retrieved successfully",
        data: column,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateColumn(req: Request, res: Response): Promise<void> {
    try {
      const { columnId } = req.params;
      const { name, description, color } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !columnId) {
        throw new BadRequestError({ message: "User not authenticated or column ID missing" });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestError({ message: "No update data provided" });
      }

      const column = await projectColumnService.updateColumn(columnId, updateData, currentUserId);

      res.status(200).json({
        success: true,
        message: "Column updated successfully",
        data: column,
      });
    } catch (error) {
      throw error;
    }
  }

  async reorderColumns(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { columnOrders } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !projectId) {
        throw new BadRequestError({ message: "User not authenticated or project ID missing" });
      }

      if (!Array.isArray(columnOrders)) {
        throw new BadRequestError({ message: "columnOrders must be an array" });
      }

      for (const order of columnOrders) {
        if (!order.columnId || typeof order.order !== "number") {
          throw new BadRequestError({
            message: "Each order item must have columnId (string) and order (number)",
          });
        }
      }

      await projectColumnService.reorderColumns(projectId, { columnOrders }, currentUserId);

      res.status(200).json({
        success: true,
        message: "Columns reordered successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteColumn(req: Request, res: Response): Promise<void> {
    try {
      const { columnId } = req.params;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !columnId) {
        throw new BadRequestError({ message: "User not authenticated or column ID missing" });
      }

      await projectColumnService.deleteColumn(columnId, currentUserId);

      res.status(200).json({
        success: true,
        message: "Column deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async addIssueToColumn(req: Request, res: Response): Promise<void> {
    try {
      const { columnId } = req.params;
      const { issueId } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !columnId) {
        throw new BadRequestError({ message: "User not authenticated or column ID missing" });
      }

      if (!issueId) {
        throw new BadRequestError({ message: "Issue ID is required" });
      }

      await projectColumnService.addIssueToColumn(columnId, issueId, currentUserId);

      res.status(200).json({
        success: true,
        message: "Issue added to column successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async removeIssueFromColumn(req: Request, res: Response): Promise<void> {
    try {
      const { columnId } = req.params;
      const { issueId } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !columnId) {
        throw new BadRequestError({ message: "User not authenticated or column ID missing" });
      }

      if (!issueId) {
        throw new BadRequestError({ message: "Issue ID is required" });
      }

      await projectColumnService.removeIssueFromColumn(columnId, issueId, currentUserId);

      res.status(200).json({
        success: true,
        message: "Issue removed from column successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async initializeDefaultColumns(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const currentUserId = req.user?.userId;

      if (!currentUserId || !projectId) {
        throw new BadRequestError({ message: "User not authenticated or project ID missing" });
      }

      const columns = await projectColumnService.initializeDefaultColumns(projectId, currentUserId);

      res.status(201).json({
        success: true,
        message: "Default columns created successfully",
        data: columns,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new ProjectColumnHandler();
