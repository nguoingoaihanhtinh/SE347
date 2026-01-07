// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB || "TaskManager",

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  FROM_NAME: process.env.FROM_NAME || "TaskManager System",

  // OTP Configuration
  OTP_EXPIRES_IN: parseInt(process.env.OTP_EXPIRES_IN || "300", 10),
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || "6", 10),

  // Application URLs
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

// Validate required env vars
const requiredVars = ["JWT_SECRET", "MONGODB_URI", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL"];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
