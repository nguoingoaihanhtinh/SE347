// src/handlers/admin.handler.ts
import { Request, Response } from "express";
import { connectMongo } from "@/config/mongodb";
import _ from "lodash";

/**
 * Get system-wide statistics for admin dashboard
 * Returns counts of users, projects, issues, and sprints
 */
export async function getSystemStats(req: Request, res: Response) {
  try {
    const db = await connectMongo();

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = startOfThisMonth;

    // Count all documents in parallel for efficiency
    const [totalUsers, totalProjects, totalIssues, totalSprints] = await Promise.all([
      db.collection("users").countDocuments({}),
      db.collection("projects").countDocuments({}),
      db.collection("issues").countDocuments({}),
      db.collection("sprints").countDocuments({}),
    ]);

    // Count active issues (not completed)
    const activeIssues = await db.collection("issues").countDocuments({
      completedAt: null,
    });

    // Count active sprints (dateEnded is null or in the future)
    const activeSprints = await db.collection("sprints").countDocuments({
      $or: [{ dateEnded: null }, { dateEnded: { $gte: now } }],
    });

    // ---- Trends (Real, Month-over-Month) ----
    const safePercentChange = (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };

    const [usersThisMonth, usersLastMonth, projectsThisMonth, projectsLastMonth, activeIssuesThisMonth, activeIssuesLastMonth] = await Promise.all([
      db.collection("users").countDocuments({ createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth } }),
      db.collection("users").countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } }),
      db.collection("projects").countDocuments({ createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth } }),
      db.collection("projects").countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } }),
      db.collection("issues").countDocuments({ createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth }, completedAt: null }),
      db.collection("issues").countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }, completedAt: null }),
    ]);

    const trends = {
      usersTrend: safePercentChange(usersThisMonth, usersLastMonth),
      projectsTrend: safePercentChange(projectsThisMonth, projectsLastMonth),
      activeIssuesTrend: safePercentChange(activeIssuesThisMonth, activeIssuesLastMonth),
    };

    // ---- Analytics ----
    // User growth: last 12 months (including current month)
    const monthKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    };

    const startOfTwelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startOfTwelveMonthsAgo.getFullYear(), startOfTwelveMonthsAgo.getMonth() + i, 1);
      months.push(monthKey(d));
    }

    const userGrowthRaw = await db
      .collection("users")
      .aggregate([
        { $match: { createdAt: { $gte: startOfTwelveMonthsAgo, $lt: startOfNextMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const userGrowthMap = new Map<string, number>(
      userGrowthRaw.map((r: any) => [String(r._id), Number(r.count || 0)])
    );

    const userGrowth = months.map((m) => ({
      month: m,
      count: userGrowthMap.get(m) || 0,
    }));

    // Weekly user growth: last 4 ISO weeks (count of NEW users per week, not cumulative)
    const isoWeekKey = (d: Date) => {
      // ISO week date algorithm (UTC-based to avoid TZ drift)
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Thursday in current week decides the year
      const dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      const year = date.getUTCFullYear();
      return `${year}-W${String(weekNo).padStart(2, "0")}`;
    };

    const startOfFourWeeksWindow = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeklyGrowthRaw = await db
      .collection("users")
      .aggregate([
        { $match: { createdAt: { $gte: startOfFourWeeksWindow, $lte: now } } },
        {
          $group: {
            _id: {
              isoWeekYear: { $isoWeekYear: "$createdAt" },
              isoWeek: { $isoWeek: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.isoWeekYear": 1, "_id.isoWeek": 1 } },
      ])
      .toArray();

    const weeklyMap = new Map<string, number>();
    weeklyGrowthRaw.forEach((r: any) => {
      const key = `${r._id.isoWeekYear}-W${String(r._id.isoWeek).padStart(2, "0")}`;
      weeklyMap.set(key, Number(r.count || 0));
    });

    // Build the last 4 ISO week keys (oldest -> newest)
    const weekKeys: string[] = [];
    for (let i = 3; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weekKeys.push(isoWeekKey(d));
    }

    const weeklyGrowth = weekKeys.map((wk, idx) => ({
      week: wk,
      name: `Week ${idx + 1}`,
      count: weeklyMap.get(wk) || 0,
    }));

    // Project type distribution (scrum / kanban)
    const projectDistribution = await db
      .collection("projects")
      .aggregate([
        {
          $group: {
            _id: "$type",
            value: { $sum: 1 },
          },
        },
        { $project: { _id: 0, name: "$_id", value: 1 } },
        { $sort: { name: 1 } },
      ])
      .toArray();

    // Issue Resolution Efficiency: Calculate average time to close issues
    const startOfLast30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfLast7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfPrevious30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 30 days before last 30 days

    // Get all completed issues
    const completedIssues = await db
      .collection("issues")
      .find({
        completedAt: { $ne: null },
        createdAt: { $exists: true },
      })
      .toArray();

    // Calculate resolution time in days for each completed issue
    const resolutionTimes = completedIssues
      .map((issue: any) => {
        if (!issue.completedAt || !issue.createdAt) return null;
        const created = new Date(issue.createdAt);
        const completed = new Date(issue.completedAt);
        const diffMs = completed.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays;
      })
      .filter((days: number | null): days is number => days !== null && days >= 0);

    // Overall average
    const avgDays = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, days) => sum + days, 0) / resolutionTimes.length
      : 0;

    // Calculate trend data: last 30 days, grouped by day
    const trendData: Array<{ date: string; avgDays: number }> = [];
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const dayIssues = completedIssues.filter((issue: any) => {
        if (!issue.completedAt) return false;
        const completed = new Date(issue.completedAt);
        return completed >= startOfDay && completed <= endOfDay;
      });

      const dayResolutionTimes = dayIssues
        .map((issue: any) => {
          if (!issue.completedAt || !issue.createdAt) return null;
          const created = new Date(issue.createdAt);
          const completed = new Date(issue.completedAt);
          const diffMs = completed.getTime() - created.getTime();
          return diffMs / (1000 * 60 * 60 * 24);
        })
        .filter((days: number | null): days is number => days !== null && days >= 0);

      const dayAvg = dayResolutionTimes.length > 0
        ? dayResolutionTimes.reduce((sum, days) => sum + days, 0) / dayResolutionTimes.length
        : 0;

      // Always add data point, even if no issues completed (for continuous chart)
      trendData.push({
        date: startOfDay.toISOString().split("T")[0]!,
        avgDays: dayAvg,
      });
    }

    // Compare last 7 days vs previous 30 days
    const last7DaysIssues = completedIssues.filter((issue: any) => {
      if (!issue.completedAt) return false;
      const completed = new Date(issue.completedAt);
      return completed >= startOfLast7Days && completed <= now;
    });

    const previous30DaysIssues = completedIssues.filter((issue: any) => {
      if (!issue.completedAt) return false;
      const completed = new Date(issue.completedAt);
      return completed >= startOfPrevious30Days && completed < startOfLast30Days;
    });

    const last7DaysTimes = last7DaysIssues
      .map((issue: any) => {
        if (!issue.completedAt || !issue.createdAt) return null;
        const created = new Date(issue.createdAt);
        const completed = new Date(issue.completedAt);
        const diffMs = completed.getTime() - created.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
      })
      .filter((days: number | null): days is number => days !== null && days >= 0);

    const previous30DaysTimes = previous30DaysIssues
      .map((issue: any) => {
        if (!issue.completedAt || !issue.createdAt) return null;
        const created = new Date(issue.createdAt);
        const completed = new Date(issue.completedAt);
        const diffMs = completed.getTime() - created.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
      })
      .filter((days: number | null): days is number => days !== null && days >= 0);

    const last7DaysAvg = last7DaysTimes.length > 0
      ? last7DaysTimes.reduce((sum, days) => sum + days, 0) / last7DaysTimes.length
      : 0;

    const previous30DaysAvg = previous30DaysTimes.length > 0
      ? previous30DaysTimes.reduce((sum, days) => sum + days, 0) / previous30DaysTimes.length
      : 0;

    // Calculate trend percentage (negative means faster, positive means slower)
    const trendPercentage = previous30DaysAvg > 0
      ? ((last7DaysAvg - previous30DaysAvg) / previous30DaysAvg) * 100
      : null;

    const resolutionStats = {
      avgDays: Number(avgDays.toFixed(2)),
      trend: trendData,
      trendPercentage: trendPercentage !== null ? Number(trendPercentage.toFixed(1)) : null,
    };

    // Issue aging buckets (0-3, 4-7, 8-14, >14 days) with open/closed split
    const issueAgeBucketsRaw = await db
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
            completedAt: 1, // Preserve để $bucket.output có thể access
          },
        },
        {
          $bucket: {
            groupBy: "$ageDays",
            boundaries: [0, 4, 8, 15],
            default: ">14",
            output: {
              openCount: {
                $sum: { $cond: [{ $eq: ["$completedAt", null] }, 1, 0] },
              },
              closedCount: {
                $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] },
              },
            },
          },
        },
      ])
      .toArray();

    const issueAgeBuckets = [
      { bucket: "0-3 days", openCount: 0, closedCount: 0 },
      { bucket: "4-7 days", openCount: 0, closedCount: 0 },
      { bucket: "8-14 days", openCount: 0, closedCount: 0 },
      { bucket: ">14 days", openCount: 0, closedCount: 0 },
    ];

    issueAgeBucketsRaw.forEach((b: any) => {
      if (!b || typeof b._id === "undefined") return;
      const key = b._id as number | string;
      const openC = Number(b.openCount || 0);
      const closedC = Number(b.closedCount || 0);
      if (key === 0) {
        issueAgeBuckets[0]!.openCount = openC;
        issueAgeBuckets[0]!.closedCount = closedC;
      } else if (key === 4) {
        issueAgeBuckets[1]!.openCount = openC;
        issueAgeBuckets[1]!.closedCount = closedC;
      } else if (key === 8) {
        issueAgeBuckets[2]!.openCount = openC;
        issueAgeBuckets[2]!.closedCount = closedC;
      } else if (key === ">14" || (typeof key === "number" && key >= 15)) {
        // Handle default bucket (>14 days) - can be string ">14" or number >= 15
        issueAgeBuckets[3]!.openCount += openC;
        issueAgeBuckets[3]!.closedCount += closedC;
      }
    });

    // Recent activity: latest created projects (top 5) + owner name
    const latestProjects = await db
      .collection("projects")
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            key: 1,
            type: 1,
            createdAt: 1,
            ownerName: {
              $ifNull: [
                "$owner.fullName",
                {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ["$owner.firstName", ""] },
                        " ",
                        { $ifNull: ["$owner.lastName", ""] },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      counts: {
        totalUsers,
        totalProjects,
        totalIssues,
        activeIssues,
        totalSprints,
        activeSprints,
      },
      trends,
      analytics: {
        userGrowth,
        weeklyGrowth,
        projectDistribution,
        resolutionStats,
        issueAgeBuckets,
        latestProjects: latestProjects.map((p: any) => ({
          id: p._id?.toString?.() ?? String(p._id),
          name: p.name ?? "Untitled",
          key: p.key ?? "",
          type: p.type ?? "scrum",
          createdAt: p.createdAt,
          ownerName: p.ownerName ?? "Unknown",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get all projects for admin view
 * Returns ALL projects in the database (ignoring membership)
 * Includes owner details and member count
 */
export async function getAllProjectsAdmin(req: Request, res: Response) {
  try {
    const db = await connectMongo();
    const { page, limit, search } = req.query;

    const pageNum = _.toInteger(page) || 1;
    const limitNum = _.toInteger(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build filter (optional search by name or key)
    const filter: any = {};
    if (search && typeof search === "string") {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { key: searchRegex },
      ];
    }

    // Fetch projects with pagination
    const projects = await db.collection("projects")
      .find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await db.collection("projects").countDocuments(filter);

    // Get all owner IDs
    const ownerIds = projects.map((p) => p.ownerId);

    // Fetch owner details in parallel
    const owners = await db.collection("users")
      .find({ _id: { $in: ownerIds } })
      .toArray();

    // Create owner lookup map
    const ownerMap = new Map();
    owners.forEach((owner) => {
      ownerMap.set(owner._id.toString(), {
        id: owner._id.toString(),
        email: owner.email,
        fullName: owner.fullName || `${owner.firstName || ""} ${owner.lastName || ""}`.trim(),
        firstName: owner.firstName,
        lastName: owner.lastName,
      });
    });

    // Get member counts for all projects
    const projectIds = projects.map((p) => p._id);
    const memberCounts = await db.collection("project_members")
      .aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
          $group: {
            _id: "$projectId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Create member count lookup map
    const memberCountMap = new Map();
    memberCounts.forEach((mc) => {
      memberCountMap.set(mc._id.toString(), mc.count);
    });

    // Map projects with owner and member count
    const mappedProjects = projects.map((project) => {
      const ownerId = project.ownerId.toString();
      const projectId = project._id.toString();
      const owner = ownerMap.get(ownerId) || {
        id: ownerId,
        email: "Unknown",
        fullName: "Unknown User",
      };

      return {
        id: projectId,
        name: project.name,
        key: project.key,
        description: project.description || null,
        access: project.access,
        type: project.type,
        ownerId: ownerId,
        owner: {
          id: owner.id,
          email: owner.email,
          fullName: owner.fullName,
        },
        memberCount: memberCountMap.get(projectId) || 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: mappedProjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
