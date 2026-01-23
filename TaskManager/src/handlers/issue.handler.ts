import _ from "lodash";
import { Request, Response } from "express";
import { BadRequestError } from "@/utils/errors";
import validate from "@/utils/validate";
import IssueService from "@/services/issue.service";
import ProjectService from "@/services/project.service";
import { createIssueSchema } from "@/dtos/issue/CreateIssue.dto";
import { updateIssueSchema } from "@/dtos/issue/UpdateIssue.dto";

// Helper: chuyển các field ngày tháng từ string → Date
function parseDateFields(data: any) {
  const dateFields = ["dueDateFrom", "dueDateTo", "completedAt"];
  const parsed = { ...data };
  for (const field of dateFields) {
    if (parsed[field] != null && typeof parsed[field] === "string") {
      parsed[field] = new Date(parsed[field]);
      if (isNaN(parsed[field].getTime())) {
        throw new BadRequestError({ message: `Invalid date format for ${field}` });
      }
    }
  }
  return parsed;
}

export async function getIssues(req: Request, res: Response) {
  let projectId = req.params.projectId || req.query.projectId;
  const columnId = req.query.columnId;
  const assigneeId = req.query.assigneeId as string | undefined;

  if (!projectId && !columnId) {
    throw new BadRequestError({ message: "Either projectId or columnId is required" });
  }

  const filters: any = {};
  if (projectId) filters.projectId = projectId;
  if (columnId) filters.columnId = columnId as string;
  if (assigneeId) filters.assigneeId = assigneeId;

  // Permission check:
  // - Allow viewing if project is public OR user is a member (enforced by ProjectService)
  // - For column-only query, the repository still requires auth, but we can't validate project here reliably
  if (projectId && req.user?.userId) {
    await ProjectService.findOneById(projectId as string, req.user.userId, req.user.role);
  }

  const { page, limit } = req.query;
  const result = await IssueService.findAll(filters, _.toInteger(page) || 1, _.toInteger(limit) || 10);
  res.status(200).json({ success: true, ...result });
}

// Board-specific issues loading:
// - Kanban: all project issues
// - Scrum: only issues belonging to the currently active sprint
export async function getIssuesForBoard(req: Request, res: Response) {
  const projectId = req.params.projectId as string | undefined;
  if (!projectId) {
    throw new BadRequestError({ message: "projectId is required for board issues" });
  }

  const { page, limit } = req.query;
  const result = await IssueService.findForBoard(
    projectId,
    _.toInteger(page) || 1,
    _.toInteger(limit) || 50,
  );

  res.status(200).json({ success: true, ...result });
}

// Jira-like: aggregated tasks assigned to the current logged-in user
export async function getMyTasks(req: Request, res: Response) {
  if (!req.user?.userId) {
    throw new BadRequestError({ message: "Authentication required" });
  }

  const { page, limit } = req.query;
  const result = await IssueService.findAll(
    { assigneeId: req.user.userId },
    _.toInteger(page) || 1,
    _.toInteger(limit) || 50,
  );

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

  try {
    // Gọi service update
    const updatedIssue = await IssueService.update(id, data, req.user!.userId);

    res.status(200).json({ success: true, issue: updatedIssue });
  } catch (error) {
    console.error("Update issue error:", error);
    throw error; // Để middleware error handler xử lý
  }
}

export async function deleteIssue(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing issue ID" });
  await IssueService.delete(id, req.user!.userId);
  res.status(200).json({ success: true });
}
