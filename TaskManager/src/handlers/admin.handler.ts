// src/handlers/admin.handler.ts
import { Request, Response } from "express";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";
import _ from "lodash";

/**
 * Get system-wide statistics for admin dashboard
 * Returns counts of users, projects, issues, and sprints
 */
export async function getSystemStats(req: Request, res: Response) {
  try {
    const db = await connectMongo();

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
    const now = new Date();
    const activeSprints = await db.collection("sprints").countDocuments({
      $or: [{ dateEnded: null }, { dateEnded: { $gte: now } }],
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalIssues,
        activeIssues,
        totalSprints,
        activeSprints,
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
