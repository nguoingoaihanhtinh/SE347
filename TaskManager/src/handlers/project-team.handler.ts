// import _ from "lodash";
// import { Request, Response } from "express";
// import { BadRequestError } from "@/utils/errors";
// import validate from "@/utils/validate";
// import ProjectTeamService from "@/services/project-team.service";
// import { createProjectTeamSchema } from "@/dtos/project-team/CreateProjectTeam.dto";
// import { updateProjectTeamSchema } from "@/dtos/project-team/UpdateProjectTeam.dto";

// export async function getProjectTeams(req: Request, res: Response) {
//   const { projectId } = req.query;
//   if (!projectId) throw new BadRequestError({ message: "projectId is required" });
//   const { page, limit } = req.query;
//   const result = await ProjectTeamService.findAllByProject(
//     projectId as string,
//     _.toInteger(page) || 1,
//     _.toInteger(limit) || 10
//   );
//   res.json({ success: true, ...result });
// }

// export async function getProjectTeamById(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing project team ID" });
//   const team = await ProjectTeamService.findOneById(id);
//   res.json({ success: true, data: team });
// }

// export async function createProjectTeam(req: Request, res: Response) {
//   const data = validate.schema_validate(createProjectTeamSchema, req.body);
//   const team = await ProjectTeamService.create(data);
//   res.status(201).json({ success: true, data: team });
// }

// export async function updateProjectTeam(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing project team ID" });
//   const data = validate.schema_validate(updateProjectTeamSchema, req.body);
//   const team = await ProjectTeamService.update(id, data);
//   res.json({ success: true, data: team });
// }

// export async function deleteProjectTeam(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing project team ID" });
//   await ProjectTeamService.delete(id);
//   res.json({ success: true });
// }
