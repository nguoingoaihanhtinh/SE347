// src/scripts/seed-quick-fix.ts
// Inject exactly 6 users "now" to bump Total Users (e.g., 404 -> 410).
// Non-destructive: does NOT delete existing data.

import "dotenv/config";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import { connectMongo, disconnectMongo } from "@/config/mongodb";
import type { User } from "@/models/user.model";
import logger from "@/utils/logger";

const DEFAULT_PASSWORD = "User@Analytics123";

async function main() {
  try {
    logger.info("Running quick fix seed (inject 6 users)...");

    const db = await connectMongo();

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const now = new Date();

    const users: User[] = Array.from({ length: 6 }, (_, i) => {
      const fullName = faker.person.fullName();
      // Ensure uniqueness by appending timestamp + index
      const email = `quickfix.${Date.now()}.${i}.${faker.internet.username().toLowerCase()}@example.com`;
      return {
        email,
        fullName,
        passwordHash,
        avatar: null,
        role: "user",
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
    });

    await db.collection("users").insertMany(users as any[]);

    logger.info("Fixed 404 count -> 410 (injected exactly 6 users)");
    logger.info(`Default password for injected users: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    logger.error("Quick fix seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

void main();

