// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "@/utils/jwt.util";
import { UnauthorizedError } from "@/utils/errors";
import { isValidObjectId } from "@/utils/mongodb";
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// src/middlewares/auth.middleware.ts
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log("=== AUTH MIDDLEWARE ===");
  console.log("Request URL:", req.originalUrl);

  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    console.log("Token found:", !!token);

    if (!token) {
      console.log("ERROR: No token provided");
      throw new UnauthorizedError({
        message: "No token provided",
        status: "NO_TOKEN",
      });
    }

    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);

    if (!decoded.userId) {
      console.log("ERROR: Token missing user ID");
      throw new UnauthorizedError({
        message: "Token missing user ID",
        status: "INVALID_TOKEN",
      });
    }

    console.log("userId from token:", decoded.userId, "Type:", typeof decoded.userId);

    if (typeof decoded.userId !== "string" || !isValidObjectId(decoded.userId)) {
      console.log("ERROR: Invalid user ID format");
      throw new UnauthorizedError({
        message: "Invalid user ID format in token",
        status: "INVALID_TOKEN",
      });
    }

    req.user = decoded;
    console.log("Auth middleware completed successfully");
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log("AUTH ERROR:", error.message);
    } else {
      console.log("AUTH ERROR:", String(error));
    }
    next(error);
  }
};
