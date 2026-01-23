// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "@/utils/jwt.util";
import { UnauthorizedError, ForbiddenError } from "@/utils/errors";
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
  console.log("=== AUTH MIDDLEWARE ==="); // Debugging log
  console.log("Request URL:", req.originalUrl); // Debugging log

  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Extract token from query parameters as fallback
    if (!token && req.query?.token) {
      token = req.query.token as string;
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    console.log("Token found:", !!token, "Token value:", token); // Debugging log

    if (!token) {
      console.error("No token provided"); // Debugging log
      throw new UnauthorizedError({
        message: "No token provided",
        status: "NO_TOKEN",
      });
    }

    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded); // Debugging log

    if (!decoded.userId) {
      console.log("ERROR: Token missing user ID");
      throw new UnauthorizedError({
        message: "Token missing user ID",
        status: "INVALID_TOKEN",
      });
    }

    // console.log("userId from token:", decoded.userId, "Type:", typeof decoded.userId);

    if (typeof decoded.userId !== "string" || !isValidObjectId(decoded.userId)) {
      console.log("ERROR: Invalid user ID format");
      throw new UnauthorizedError({
        message: "Invalid user ID format in token",
        status: "INVALID_TOKEN",
      });
    }

    req.user = decoded;
    // console.log("Auth middleware completed successfully");
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

/**
 * Middleware to require admin or super_admin role
 * Throws 403 Forbidden if user is not admin or super_admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError({ message: "Authentication required" });
  }

  const userRole = req.user.role;
  if (userRole !== "admin" && userRole !== "super_admin") {
    throw new ForbiddenError({
      message: "Admin access required. You do not have permission to perform this action.",
    });
  }

  next();
};

/**
 * Middleware to require super_admin role only
 * Throws 403 Forbidden if user is not super_admin
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError({ message: "Authentication required" });
  }

  if (req.user.role !== "super_admin") {
    throw new ForbiddenError({
      message: "Super Admin access required. You do not have permission to perform this action.",
    });
  }

  next();
};
