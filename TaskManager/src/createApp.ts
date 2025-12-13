// src/createApp.ts
import "express-async-errors";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.route";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import issueRoutes from "./routes/issue.route";
import sprintRoutes from "./routes/sprint.route";
import { requestLogger, errorHandler } from "@/middlewares";

import { specs, swaggerUi } from "./config/swagger";
import logger from "./utils/logger";

import { connectMongo } from "./config/mongodb";
import { issue } from "zod/v4/core/util.cjs";

export const createApp = async () => {
  await connectMongo();
  const app = express();

  // Middlewares
  app.use(
    cors({
      exposedHeaders: ["Authorization"],
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  logger.info("📚 Swagger API documentation is available at http://localhost:3000/api-docs");

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/issues", issueRoutes);
  app.use("/api/sprints", sprintRoutes);

  // Error handler
  app.use(errorHandler);

  return app;
};
