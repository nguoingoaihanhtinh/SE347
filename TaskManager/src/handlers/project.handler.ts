// handlers/project.handler.ts
import _ from "lodash";
import { Request, Response } from "express-serve-static-core";
import { BadRequestError } from "@/utils/errors";
import validate from "@/utils/validate";
import ProjectService from "@/services/project.service";
import { createProjectSchema } from "@/dtos/project/CreateProject.dto";
import { updateProjectSchema } from "@/dtos/project/UpdateProject.dto";

export async function getProjects(req: Request, res: Response) {
  const { page, limit } = req.query;
  const result = await ProjectService.findAll(_.toInteger(page) || 1, _.toInteger(limit) || 10);
  res.status(200).json({ success: true, ...result });
}

export async function getProjectById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing project ID" });
  const project = await ProjectService.findOneById(id);
  res.status(200).json({ success: true, data: project });
}

export async function createProject(req: Request, res: Response) {
  const data = validate.schema_validate(createProjectSchema, req.body);
  const project = await ProjectService.create(data);
  res.status(201).json({ success: true, data: project });
}

export async function updateProject(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing project ID" });
  const data = validate.schema_validate(updateProjectSchema, req.body);
  const project = await ProjectService.update(id, data as any);
  res.status(200).json({ success: true, data: project });
}

export async function deleteProject(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw new BadRequestError({ message: "Missing project ID" });
  await ProjectService.delete(id);
  res.status(200).json({ success: true });
}
