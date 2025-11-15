// src/middlewares/error.middleware.ts
import logger from "@/utils/logger";
import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Internal Server Error";

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}\n${err.stack || ""}`);

  res.status(statusCode).json({
    success: false,
    status_code: statusCode,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
