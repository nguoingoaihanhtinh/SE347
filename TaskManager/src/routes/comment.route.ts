// // src/routes/comment.route.ts
// import { Router } from "express";
// import { authenticate } from "@/middlewares/auth.middleware";
// import {
//   createComment,
//   deleteComment,
//   getCommentById,
//   getComments,
//   updateComment,
// } from "@/handlers/comment.handler";

// const router = Router();

// // GET /api/comments?issueId=xxx → all comments for an issue
// router.get("/", getComments);
// router.get("/:id", getCommentById);
// router.post("/", authenticate, createComment);
// router.put("/:id", authenticate, updateComment);
// router.delete("/:id", authenticate, deleteComment);

// export default router;
