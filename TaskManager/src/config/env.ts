// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  JWT_SECRET: process.env.JWT_SECRET,
};

// Validate required env vars
if (!env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}
