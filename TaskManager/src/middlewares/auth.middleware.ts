import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "@/utils/jwt.util";
import { UnauthorizedError } from "@/utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError({
        message: "No token provided",
        status: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError({
        message: "No token provided",
        status: "NO_TOKEN",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
