import jwt from "jsonwebtoken";
import { JWTError, InternalServerError } from "./errors";
import { env } from "@/config/env";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  if (!env.JWT_SECRET) {
    throw new InternalServerError({
      message: "JWT_SECRET is not defined",
      status: "JWT_CONFIG_ERROR",
    });
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    if (!env.JWT_SECRET) {
      throw new InternalServerError({
        message: "JWT_SECRET is not defined",
        status: "JWT_CONFIG_ERROR",
      });
    }

    console.log("Verifying token:", token); // Debugging log
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    console.log("Decoded token payload:", decoded); // Debugging log
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new JWTError({
        message: "Invalid token",
        status: "INVALID_TOKEN",
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new JWTError({
        message: "Token has expired",
        status: "TOKEN_EXPIRED",
      });
    }
    throw new JWTError({
      message: "Token verification failed",
      status: "TOKEN_ERROR",
    });
  }
};
