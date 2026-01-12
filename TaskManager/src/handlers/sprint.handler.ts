// src/handlers/sprint.handler.ts
import _ from "lodash";
import { Request, Response } from "express";
import { BadRequestError } from "@/utils/errors";
import validate from "@/utils/validate";
import SprintService from "@/services/sprint.service";
import { createSprintSchema } from "@/dtos/sprint/CreateSprint.dto";
import { updateSprintSchema } from "@/dtos/sprint/UpdateSprint.dto";

// Helper: chuyển string → Date cho các field ngày
function parseDateFields(data: any) {
  const parsed = { ...data };
  if (parsed.dateStarted) parsed.dateStarted = new Date(parsed.dateStarted);
  if (parsed.dateEnded) parsed.dateEnded = new Date(parsed.dateEnded);
  return parsed;
}

export async function getSprints(req: Request, res: Response) {
  const projectId = req.params.projectId || req.query.projectId;

  if (!projectId) {
    throw new BadRequestError({ message: "projectId is required" });
  }
  console.log("Project ID:", projectId);
  const { page, limit } = req.query;
  const result = await SprintService.findAllByProject(
    projectId as string,
    _.toInteger(page) || 1,
    _.toInteger(limit) || 10
  );
  res.json({ success: true, ...result });
}

export async function getSprintById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing sprint ID" });
  const sprint = await SprintService.findOneById(id);
  res.json({ success: true, data: sprint });
}

export async function createSprint(req: Request, res: Response) {
  const rawData = validate.schema_validate(createSprintSchema, req.body);

  const finalData = {
    ...rawData,
    projectId: req.params.projectId || rawData.projectId,
  };

  if (!finalData.projectId) {
    throw new BadRequestError({ message: "projectId is required" });
  }

  const data = parseDateFields(finalData);
  const sprint = await SprintService.create(data, req.user!.userId);
  res.status(201).json({ success: true, data: sprint });
}

export async function updateSprint(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing sprint ID" });
  const rawData = validate.schema_validate(updateSprintSchema, req.body);
  const data = parseDateFields(rawData);
  const sprint = await SprintService.update(id, data, req.user!.userId);
  res.json({ success: true, data: sprint });
}

export async function deleteSprint(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing sprint ID" });
  await SprintService.delete(id, req.user!.userId);
  res.json({ success: true });
}
