// src/createApp.ts
import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.route";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import projectMemberRoutes from "./routes/project-member.route";
import projectColumnRoutes from "./routes/project-column.route";
import issueRoutes from "./routes/issue.route";
import sprintRoutes from "./routes/sprint.route";
import commentRoutes from "./routes/comment.route";
import projectTeamRoutes from "./routes/project-team.route";
import { requestLogger, errorHandler } from "@/middlewares";

import { specs, swaggerUi } from "./config/swagger";
import logger from "./utils/logger";

import { connectMongo } from "./config/mongodb";

export const createApp = async () => {
  await connectMongo();
  const app = express();

  // Middlewares
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      exposedHeaders: ["Authorization"],
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  logger.info("Swagger API documentation is available at http://localhost:3000/api-docs");

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  // app.use("/api/projects", projectMemberRoutes);
  // app.use("/api/projects", projectColumnRoutes);
  app.use("/api/issues", issueRoutes);
  app.use("/api/sprints", sprintRoutes);
  // app.use("/api/comments", commentRoutes);
  // app.use("/api/project-teams", projectTeamRoutes);

  // Error handler
  app.use(errorHandler);

  return app;
};
