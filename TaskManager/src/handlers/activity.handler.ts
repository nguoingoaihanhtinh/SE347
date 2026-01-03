// src/handlers/activity.handler.ts
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
    _.toInteger(limit) || 20
  );

  res.status(200).json({ success: true, ...result });
}
