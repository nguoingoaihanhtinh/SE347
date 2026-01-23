// src/scripts/seed-analytics.ts
// Inject additional realistic data for analytics charts WITHOUT deleting existing data.

import "dotenv/config";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";

import { connectMongo, disconnectMongo } from "@/config/mongodb";
import type { User } from "@/models/user.model";
import type { Project } from "@/models/project.model";
import logger from "@/utils/logger";

const DEFAULT_PASSWORD = "User@Analytics123";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

function randomDateInMonth(year: number, month: number): Date {
  // month: 1-12
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return randomDateBetween(start, end);
}

function generateProjectKey(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const initials = words.map((w) => w[0]?.toUpperCase() || "").join("");
  const base = initials.substring(0, 4) || "PRJ";
  const suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${base}${suffix}`;
}

async function getExistingUserIds(): Promise<string[]> {
  const db = await connectMongo();
  const users = await db
    .collection("users")
    .find({}, { projection: { _id: 1 } })
    .toArray();
  return users.map((u) => u._id.toString());
}

async function injectMonthlyUsers(passwordHash: string) {
  const db = await connectMongo();

  // From Feb 2025 (2) to Dec 2025 (12)
  for (let month = 2; month <= 12; month += 1) {
    const count = randomInt(5, 25);
    const usersToInsert: User[] = [];

    for (let i = 0; i < count; i += 1) {
      const fullName = faker.person.fullName();
      const email = faker.internet.email({ firstName: fullName.split(" ")[0] || "user", lastName: "analytics" });

      const createdAt = randomDateInMonth(2025, month);

      usersToInsert.push({
        email,
        fullName,
        passwordHash,
        avatar: null,
        role: "user",
        isEmailVerified: true,
        isActive: true,
        createdAt,
        updatedAt: new Date(),
      });
    }

    if (usersToInsert.length > 0) {
      await db.collection("users").insertMany(usersToInsert as any[]);
    }

    logger.info(`👥 Injected ${usersToInsert.length} users for ${2025}-${String(month).padStart(2, "0")}`);
  }
}

async function injectRecentWeeklyUsers(passwordHash: string) {
  const db = await connectMongo();

  // Last 4 weeks from Dec 21, 2025 to Jan 21, 2026
  const baseStart = new Date(2025, 11, 21, 0, 0, 0, 0); // 2025-12-21
  const endLimit = new Date(2026, 0, 21, 23, 59, 59, 999); // 2026-01-21

  // Explicitly varied counts per week
  const weeklyCounts = [3, 8, 12, 5];

  for (let weekIndex = 0; weekIndex < 4; weekIndex += 1) {
    const weekStart = new Date(baseStart.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
    const rawWeekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    const weekEnd = rawWeekEnd > endLimit ? endLimit : rawWeekEnd;

    const count = weeklyCounts[weekIndex] ?? randomInt(3, 15);
    const usersToInsert: User[] = [];

    for (let i = 0; i < count; i += 1) {
      const fullName = faker.person.fullName();
      const email = faker.internet.email({ firstName: fullName.split(" ")[0] || "user", lastName: "weekly" });
      const createdAt = randomDateBetween(weekStart, weekEnd);

      usersToInsert.push({
        email,
        fullName,
        passwordHash,
        avatar: null,
        role: "user",
        isEmailVerified: true,
        isActive: true,
        createdAt,
        updatedAt: new Date(),
      });
    }

    if (usersToInsert.length > 0) {
      await db.collection("users").insertMany(usersToInsert as any[]);
    }

    logger.info(
      `📈 Injected ${usersToInsert.length} users for week ${weekIndex + 1} (${weekStart.toISOString()} - ${weekEnd.toISOString()})`
    );
  }
}

async function injectProjects() {
  const db = await connectMongo();

  const existingUserIds = await getExistingUserIds();
  if (existingUserIds.length === 0) {
    logger.warn("⚠️ No existing users found. Skipping project injection.");
    return;
  }

  const projectCount = randomInt(50, 60);
  const projectsToInsert: Project[] = [];

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < projectCount; i += 1) {
    const name = faker.commerce.productName();
    const key = generateProjectKey(name);
    const ownerId = existingUserIds[randomInt(0, existingUserIds.length - 1)]!;

    const isScrum = Math.random() < 0.85; // 85% scrum
    const type: Project["type"] = isScrum ? "scrum" : "kanban";

    const createdAt = randomDateBetween(sixMonthsAgo, now);

    const project: Project = {
      name,
      key,
      description: faker.commerce.productDescription(),
      access: Math.random() > 0.2 ? "private" : "public",
      type,
      ownerId: new ObjectId(ownerId).toString(),
      createdAt,
      updatedAt: new Date(),
    };

    projectsToInsert.push(project);
  }

  if (projectsToInsert.length > 0) {
    // Convert ownerId back to ObjectId for persistence
    const docs = projectsToInsert.map((p) => ({
      ...p,
      ownerId: new ObjectId(p.ownerId),
    }));
    await db.collection("projects").insertMany(docs as any[]);
  }

  const scrumCount = projectsToInsert.filter((p) => p.type === "scrum").length;
  const kanbanCount = projectsToInsert.filter((p) => p.type === "kanban").length;

  logger.info(
    `📁 Injected ${projectsToInsert.length} projects (Scrum: ${scrumCount}, Kanban: ${kanbanCount}) over the last 6 months`
  );
}

async function main() {
  try {
    logger.info("🌱 Starting analytics data seeding (non-destructive)...");

    await connectMongo();
    logger.info("✅ Connected to MongoDB");

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await injectMonthlyUsers(passwordHash);
    await injectRecentWeeklyUsers(passwordHash);
    await injectProjects();

    logger.info("🎉 Analytics data seeding completed successfully!");
    logger.info(`🔐 Injected users use default password: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    logger.error("❌ Error during analytics seeding:", error);
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

void main();

