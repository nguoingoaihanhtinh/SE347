// // src/routes/project-team.route.ts
// import { Router } from "express";
// import { authenticate } from "@/middlewares/auth.middleware";
// import {
//   createProjectTeam,
//   deleteProjectTeam,
//   getProjectTeamById,
//   getProjectTeams,
//   updateProjectTeam,
// } from "@/handlers/project-team.handler";

// const router = Router();

// // GET /api/project-teams?projectId=xxx → all teams in a project
// router.get("/", getProjectTeams);
// router.get("/:id", getProjectTeamById);
// router.post("/", authenticate, createProjectTeam);
// router.put("/:id", authenticate, updateProjectTeam);
// router.delete("/:id", authenticate, deleteProjectTeam);

// export default router;
