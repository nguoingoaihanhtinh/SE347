// src/scripts/verify-issue-aging.ts
// Verify that Issue Aging chart data matches actual database counts.
// Run this to check if the chart is displaying real data.

import "dotenv/config";
import { connectMongo, disconnectMongo } from "@/config/mongodb";
import logger from "@/utils/logger";

async function main() {
  try {
    logger.info("Verifying Issue Aging data...");

    const db = await connectMongo();
    const now = new Date();

    // Calculate age buckets manually (same logic as backend)
    const issues = await db
      .collection("issues")
      .aggregate([
        {
          $project: {
            ageDays: {
              $ceil: {
                $divide: [
                  {
                    $subtract: [
                      { $ifNull: ["$completedAt", now] },
                      "$createdAt",
                    ],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            completedAt: 1,
          },
        },
      ])
      .toArray();

    // Manual bucket calculation
    const buckets = {
      "0-3": { open: 0, closed: 0 },
      "4-7": { open: 0, closed: 0 },
      "8-14": { open: 0, closed: 0 },
      ">14": { open: 0, closed: 0 },
    };

    issues.forEach((issue: any) => {
      const ageDays = issue.ageDays;
      const isOpen = issue.completedAt === null;

      if (ageDays >= 0 && ageDays < 4) {
        if (isOpen) buckets["0-3"].open++;
        else buckets["0-3"].closed++;
      } else if (ageDays >= 4 && ageDays < 8) {
        if (isOpen) buckets["4-7"].open++;
        else buckets["4-7"].closed++;
      } else if (ageDays >= 8 && ageDays < 15) {
        if (isOpen) buckets["8-14"].open++;
        else buckets["8-14"].closed++;
      } else if (ageDays >= 15) {
        if (isOpen) buckets[">14"].open++;
        else buckets[">14"].closed++;
      }
    });

    logger.info("\n📊 Issue Aging Verification Results:");
    logger.info("=" .repeat(50));
    logger.info("Bucket        | Open   | Closed | Total");
    logger.info("-".repeat(50));
    logger.info(`0-3 days      | ${String(buckets["0-3"].open).padStart(5)} | ${String(buckets["0-3"].closed).padStart(6)} | ${buckets["0-3"].open + buckets["0-3"].closed}`);
    logger.info(`4-7 days      | ${String(buckets["4-7"].open).padStart(5)} | ${String(buckets["4-7"].closed).padStart(6)} | ${buckets["4-7"].open + buckets["4-7"].closed}`);
    logger.info(`8-14 days     | ${String(buckets["8-14"].open).padStart(5)} | ${String(buckets["8-14"].closed).padStart(6)} | ${buckets["8-14"].open + buckets["8-14"].closed}`);
    logger.info(`>14 days      | ${String(buckets[">14"].open).padStart(5)} | ${String(buckets[">14"].closed).padStart(6)} | ${buckets[">14"].open + buckets[">14"].closed}`);
    logger.info("=" .repeat(50));

    const totalOpen = buckets["0-3"].open + buckets["4-7"].open + buckets["8-14"].open + buckets[">14"].open;
    const totalClosed = buckets["0-3"].closed + buckets["4-7"].closed + buckets["8-14"].closed + buckets[">14"].closed;

    logger.info(`Total Open    | ${totalOpen}`);
    logger.info(`Total Closed  | ${totalClosed}`);
    logger.info(`Grand Total   | ${totalOpen + totalClosed}`);

    // Verify against API endpoint logic
    logger.info("\n🔍 Compare these numbers with the chart on the dashboard.");
    logger.info("If they match, the chart is displaying REAL data ✅");
    logger.info("If they don't match, there may be a backend aggregation bug ❌");

  } catch (error) {
    logger.error("Verification failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

void main();
