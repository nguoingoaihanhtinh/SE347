// src/scripts/seed-fix-issues.ts
// Re-open 35% of issues and redistribute their createdAt dates
// to create realistic data for the Issue Aging chart.
// Non-destructive: only updates existing issues.

import "dotenv/config";
import { ObjectId } from "mongodb";

import { connectMongo, disconnectMongo } from "@/config/mongodb";
import logger from "@/utils/logger";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Get a random createdAt date based on age bucket distribution:
 * - 20%: 0-3 days ago
 * - 20%: 4-7 days ago
 * - 20%: 8-14 days ago
 * - 40%: >14 days ago
 */
function getRandomCreatedAt(now: Date): Date {
  const rand = Math.random();
  
  if (rand < 0.2) {
    // 0-3 days ago
    const daysAgo = randomInt(0, 3);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else if (rand < 0.4) {
    // 4-7 days ago
    const daysAgo = randomInt(4, 7);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else if (rand < 0.6) {
    // 8-14 days ago
    const daysAgo = randomInt(8, 14);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else {
    // >14 days ago (up to 90 days for variety)
    const daysAgo = randomInt(15, 90);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
}

async function main() {
  try {
    logger.info("Running seed-fix-issues: Re-opening issues and redistributing dates...");

    const db = await connectMongo();
    const now = new Date();

    // Fetch all issues
    const allIssues = await db.collection("issues").find({}).toArray();
    const totalIssues = allIssues.length;

    if (totalIssues === 0) {
      logger.warn("No issues found in database. Skipping seed.");
      return;
    }

    logger.info(`Found ${totalIssues} total issues`);

    // Calculate 35% of issues to re-open
    const targetOpenCount = Math.floor(totalIssues * 0.35);
    logger.info(`Target: Re-opening ${targetOpenCount} issues (35% of ${totalIssues})`);

    // Shuffle array to randomly select issues
    const shuffled = [...allIssues].sort(() => Math.random() - 0.5);
    const issuesToReopen = shuffled.slice(0, targetOpenCount);

    logger.info(`Selected ${issuesToReopen.length} issues to re-open`);

    // Track distribution for logging
    const ageDistribution = {
      "0-3 days": 0,
      "4-7 days": 0,
      "8-14 days": 0,
      ">14 days": 0,
    };

    // Update issues in batches
    let updatedCount = 0;
    for (const issue of issuesToReopen) {
      const newCreatedAt = getRandomCreatedAt(now);
      
      // Determine age bucket for logging
      const ageDays = Math.floor((now.getTime() - newCreatedAt.getTime()) / (24 * 60 * 60 * 1000));
      if (ageDays <= 3) {
        ageDistribution["0-3 days"]++;
      } else if (ageDays <= 7) {
        ageDistribution["4-7 days"]++;
      } else if (ageDays <= 14) {
        ageDistribution["8-14 days"]++;
      } else {
        ageDistribution[">14 days"]++;
      }

      await db.collection("issues").updateOne(
        { _id: issue._id },
        {
          $set: {
            completedAt: null, // Re-open the issue
            createdAt: newCreatedAt, // Redistribute age
            updatedAt: now, // Update timestamp
          },
        }
      );

      updatedCount++;
    }

    logger.info(`✅ Successfully updated ${updatedCount} issues`);
    logger.info("Age distribution of re-opened issues:");
    logger.info(`  - 0-3 days: ${ageDistribution["0-3 days"]}`);
    logger.info(`  - 4-7 days: ${ageDistribution["4-7 days"]}`);
    logger.info(`  - 8-14 days: ${ageDistribution["8-14 days"]}`);
    logger.info(`  - >14 days: ${ageDistribution[">14 days"]}`);

    // Verify the result
    const openIssuesCount = await db.collection("issues").countDocuments({
      completedAt: null,
    });
    logger.info(`📊 Total open issues after update: ${openIssuesCount}`);

  } catch (error) {
    logger.error("seed-fix-issues failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

void main();
