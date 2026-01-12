// src/handlers/issue.handler.ts
import _ from "lodash";
import { Request, Response } from "express";
import { BadRequestError } from "@/utils/errors";
import validate from "@/utils/validate";
import IssueService from "@/services/issue.service";
import { createIssueSchema } from "@/dtos/issue/CreateIssue.dto";
import { updateIssueSchema } from "@/dtos/issue/UpdateIssue.dto";

// Helper: chuyển các field ngày tháng từ string → Date
function parseDateFields(data: any) {
  const dateFields = ["dueDateFrom", "dueDateTo", "completedAt"];
  const parsed = { ...data };
  for (const field of dateFields) {
    if (parsed[field] != null) {
      parsed[field] = new Date(parsed[field]);
    }
  }
  return parsed;
}

export async function getIssues(req: Request, res: Response) {
  let projectId = req.params.projectId || req.query.projectId;
  const columnId = req.query.columnId;

  if (!projectId && !columnId) {
    throw new BadRequestError({ message: "Either projectId or columnId is required" });
  }

  const filters: any = {};
  if (projectId) filters.projectId = projectId;
  if (columnId) filters.columnId = columnId as string;

  const { page, limit } = req.query;
  const result = await IssueService.findAll(filters, _.toInteger(page) || 1, _.toInteger(limit) || 10);
  res.status(200).json({ success: true, ...result });
}

export async function getIssueById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing issue ID" });
  const issue = await IssueService.findOneById(id);
  res.status(200).json({ success: true, issue });
}

export async function createIssue(req: Request, res: Response) {
  let rawData = validate.schema_validate(createIssueSchema, req.body);

  rawData.reporterId = req.user!.userId;

  if (req.params.projectId) {
    rawData.projectId = req.params.projectId;
  }

  if (!rawData.projectId) {
    throw new BadRequestError({ message: "projectId is required" });
  }

  const data = parseDateFields(rawData);
  if (!data.summary) data.summary = data.title;

  const issue = await IssueService.create(data, req.user!.userId);
  res.status(201).json({ success: true, issue });
}

export async function updateIssue(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing issue ID" });
  const rawData = validate.schema_validate(updateIssueSchema, req.body);
  const data = parseDateFields(rawData);
  const issue = await IssueService.update(id, data, req.user!.userId);
  res.status(200).json({ success: true, issue });
}

export async function deleteIssue(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing issue ID" });
  await IssueService.delete(id, req.user!.userId);
  res.status(200).json({ success: true });
}
