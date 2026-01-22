// import _ from "lodash";
// import { Request, Response } from "express";
// import { BadRequestError } from "@/utils/errors";
// import validate from "@/utils/validate";
// import CommentService from "@/services/comment.service";
// import { createCommentSchema } from "@/dtos/comment/CreateComment.dto";
// import { updateCommentSchema } from "@/dtos/comment/UpdateComment.dto";

// export async function getComments(req: Request, res: Response) {
//   const { issueId } = req.query;
//   if (!issueId) throw new BadRequestError({ message: "issueId is required" });
//   const { page, limit } = req.query;
//   const result = await CommentService.findAllByIssue(
//     issueId as string,
//     _.toInteger(page) || 1,
//     _.toInteger(limit) || 10
//   );
//   res.json({ success: true, ...result });
// }

// export async function getCommentById(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing comment ID" });
//   const comment = await CommentService.findOneById(id);
//   res.json({ success: true, data: comment });
// }

// export async function createComment(req: Request, res: Response) {
//   const data = validate.schema_validate(createCommentSchema, req.body);
//   const commentData = {
//     ...data,
//     userId: req.user!.userId,
//   };
//   const comment = await CommentService.create(commentData);
//   res.status(201).json({ success: true, data: comment });
// }

// export async function updateComment(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing comment ID" });
//   const data = validate.schema_validate(updateCommentSchema, req.body);
//   const comment = await CommentService.update(id, data);
//   res.json({ success: true, data: comment });
// }

// export async function deleteComment(req: Request, res: Response) {
//   const { id } = req.params;
//   if (!id) throw new BadRequestError({ message: "Missing comment ID" });
//   await CommentService.delete(id);
//   res.json({ success: true });
// }
