import _ from "lodash";
import { Request, Response } from "express";
import { BadRequestError } from "@/utils/errors";
import ActivityService from "@/services/activity.service";

export async function getProjectActivities(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    throw new BadRequestError({ message: "projectId is required" });
  }

  const { page, limit } = req.query;

  const result = await ActivityService.getProjectActivities(
    projectId,
    _.toInteger(page) || 1,
    _.toInteger(limit) || 20,
  );

  res.status(200).json({
    success: true,
    data: result.mapped,
    pagination: result.pagination,
  });
}

export async function getNewActivities(req: Request, res: Response) {
  const { projectId } = req.params;
  const { since } = req.query;

  if (!projectId) {
    throw new BadRequestError({ message: "projectId is required" });
  }

  const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 30000);

  const result = await ActivityService.getNewActivities(projectId, sinceDate);

  res.status(200).json({
    success: true,
    data: result.mapped,
    lastUpdated: new Date().toISOString(),
  });
}
