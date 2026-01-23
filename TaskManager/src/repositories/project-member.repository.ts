// src/repositories/project-member.repository.ts
import { MongoClient, Db, Collection } from "mongodb";
import { connectMongo } from "@/config/mongodb";
import { ProjectMember } from "@/models/project.model";
import { TeamMemberRole, ProjectMemberWithDetails, ProjectMemberStats } from "@/models/project-member.model";
import { ObjectId } from "mongodb";

class ProjectMemberRepository {
  private db: Db | null = null;
  private collection: Collection<ProjectMember> | null = null;

  private async getCollection(): Promise<Collection<ProjectMember>> {
    if (!this.collection) {
      this.db = await connectMongo();
      this.collection = this.db.collection<ProjectMember>("project_members");

      const createIndexSafely = async (index: any, options: any = {}) => {
        try {
          await this.collection!.createIndex(index, options);
        } catch (error: any) {
          if (error.code !== 85 && error.code !== 86) {
            throw error;
          }
          console.log(`Index already exists: ${JSON.stringify(index)}`);
        }
      };

      await createIndexSafely({ projectId: 1 });
      await createIndexSafely({ userId: 1 });
      await createIndexSafely({ projectId: 1, userId: 1 }, { unique: true });
    }
    return this.collection;
  }

  async create(memberData: Omit<ProjectMember, "id">): Promise<ProjectMember> {
    console.log("💾 [REPO] create called with data:", JSON.stringify(memberData, null, 2));
    const collection = await this.getCollection();
    console.log("💾 [REPO] Collection name:", collection.collectionName);

    // Convert to MongoDB document format (camelCase for compatibility)
    // Note: MongoDB stores as-is, schema validation in migration uses snake_case but we use camelCase
    const memberDoc: any = {
      projectId: ObjectId.isValid(memberData.projectId) ? new ObjectId(memberData.projectId) : memberData.projectId,
      userId: ObjectId.isValid(memberData.userId) ? new ObjectId(memberData.userId) : memberData.userId,
      teamIds: memberData.teamIds || [],
      role: memberData.role,
      isPending: memberData.isPending ?? (memberData.status !== "active"),
      status: memberData.status || (memberData.isPending ? "pending_invite" : "active"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("💾 [REPO] Creating project member doc:", JSON.stringify(memberDoc, null, 2));
    try {
      const result = await collection.insertOne(memberDoc);
      console.log("💾 [REPO] Insert successful, insertedId:", result.insertedId.toString());
      
      // Return in ProjectMember format
      return {
        id: result.insertedId.toString(),
        projectId: memberData.projectId,
        userId: memberData.userId,
        teamIds: memberData.teamIds || [],
        role: memberData.role,
        isPending: memberDoc.isPending,
        status: memberDoc.status,
        createdAt: memberDoc.createdAt,
        updatedAt: memberDoc.updatedAt,
      };
    } catch (error: any) {
      console.error("💾 [REPO] Insert failed:", error);
      throw error;
    }
  }

  async updateStatus(projectId: string, userId: string, status: "active" | "pending_invite" | "pending_request"): Promise<ProjectMember | null> {
    const collection = await this.getCollection();
    
    const query: any = {};
    if (ObjectId.isValid(projectId)) {
      query.projectId = new ObjectId(projectId);
    } else {
      query.projectId = projectId;
    }
    
    if (ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId);
    } else {
      query.userId = userId;
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      {
        $set: {
          status,
          isPending: status !== "active",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id?.toString(),
      projectId: result.projectId?.toString() || result.projectId,
      userId: result.userId?.toString() || result.userId,
    };
  }

  async findByProject(projectId: string): Promise<ProjectMember[]> {
    const collection = await this.getCollection();
    // Handle both string and ObjectId projectId
    const query: any = ObjectId.isValid(projectId) 
      ? { projectId: new ObjectId(projectId) }
      : { projectId };
    const members = await collection.find(query).toArray();
    console.log(`Found ${members.length} members for projectId ${projectId}`);
    return members.map((member) => ({
      ...member,
      id: member._id?.toString(),
      projectId: member.projectId?.toString() || member.projectId,
      userId: member.userId?.toString() || member.userId,
    }));
  }

  async findByProjectWithUserDetails(projectId: string): Promise<ProjectMemberWithDetails[]> {
    const collection = await this.getCollection();
    const db = await connectMongo();

    // Handle both string and ObjectId projectId
    const matchQuery: any = ObjectId.isValid(projectId)
      ? { projectId: new ObjectId(projectId) }
      : { projectId };

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$userId" }],
                },
              },
            },
          ],
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          projectId: { $toString: "$projectId" },
          userId: { $toString: "$userId" },
          teamIds: 1,
          role: 1,
          isPending: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            $cond: {
              if: { $ne: ["$userInfo", null] },
              then: {
                id: { $toString: "$userInfo._id" },
                email: "$userInfo.email",
                fullName: "$userInfo.fullName",
                avatar: "$userInfo.avatar",
              },
              else: null,
            },
          },
        },
      },
    ];

    const members = await collection.aggregate(pipeline).toArray();
    return members as ProjectMemberWithDetails[];
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    console.log("🔍 Finding member - Project ID:", projectId, "User ID:", userId);
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId for projectId and userId
    const query: any = {};
    if (ObjectId.isValid(projectId)) {
      query.projectId = new ObjectId(projectId);
    } else {
      query.projectId = projectId;
    }
    
    if (ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId);
    } else {
      query.userId = userId;
    }
    
    const member = await collection.findOne(query);
    console.log("🔍 Found member:", member);
    if (!member) return null;

    return {
      ...member,
      id: member._id?.toString(),
      projectId: member.projectId?.toString() || member.projectId,
      userId: member.userId?.toString() || member.userId,
    };
  }

  async updateRole(projectId: string, userId: string, role: TeamMemberRole): Promise<ProjectMember | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { projectId, userId },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id?.toString(),
    };
  }

  async updateTeams(projectId: string, userId: string, teamIds: string[]): Promise<ProjectMember | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { projectId, userId },
      {
        $set: {
          teamIds,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id?.toString(),
    };
  }

  async remove(projectId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId for projectId and userId
    const query: any = {};
    if (ObjectId.isValid(projectId)) {
      query.projectId = new ObjectId(projectId);
    } else {
      query.projectId = projectId;
    }
    
    if (ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId);
    } else {
      query.userId = userId;
    }
    
    console.log("🗑️ [REPO] Removing member with query:", JSON.stringify(query));
    const result = await collection.deleteOne(query);
    console.log("🗑️ [REPO] Delete result:", result.deletedCount > 0 ? "Success" : "Not found");
    return result.deletedCount > 0;
  }

  async removeById(memberId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(memberId) });
    return result.deletedCount > 0;
  }

  async getProjectStats(projectId: string): Promise<ProjectMemberStats> {
    const collection = await this.getCollection();

    const pipeline = [
      { $match: { projectId } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ];

    const roleStats = await collection.aggregate(pipeline).toArray();
    const totalMembers = await collection.countDocuments({ projectId });

    const stats: ProjectMemberStats = {
      totalMembers,
      ownerCount: 0,
      adminCount: 0,
      memberCount: 0,
      viewerCount: 0,
      pendingInvitations: 0,
    };

    roleStats.forEach((stat) => {
      switch (stat._id) {
        case "owner":
          stats.ownerCount = stat.count;
          break;
        case "admin":
          stats.adminCount = stat.count;
          break;
        case "member":
          stats.memberCount = stat.count;
          break;
        case "viewer":
          stats.viewerCount = stat.count;
          break;
      }
    });

    return stats;
  }

  async countByRole(projectId: string, role: TeamMemberRole): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({ projectId, role });
  }

  async isUserProjectMember(projectId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const count = await collection.countDocuments({ projectId, userId });
    return count > 0;
  }

  async getUserRole(projectId: string, userId: string): Promise<TeamMemberRole | null> {
    const member = await this.findByProjectAndUser(projectId, userId);
    return member ? member.role : null;
  }

  async findByUser(userId: string): Promise<ProjectMember[]> {
    const collection = await this.getCollection();
    const query: any = { userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId };
    const members = await collection.find(query).toArray();
    return members.map((member) => ({
      ...member,
      id: member._id?.toString(),
      projectId: member.projectId?.toString() || member.projectId,
      userId: member.userId?.toString() || member.userId,
    }));
  }

  async findPendingInvitationsByUser(userId: string): Promise<ProjectMemberWithDetails[]> {
    const collection = await this.getCollection();
    const db = await connectMongo();

    // Handle both string and ObjectId for userId
    const userIdQuery = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    
    // Combine the conditions properly
    const query: any = {
      $and: [
        {
          $or: [
            { userId: userIdQuery },
            { userId: userId }, // Also try as string in case it's stored as string
          ],
        },
        {
          $or: [
            { status: "pending_invite" },
            { status: { $exists: false }, isPending: true }, // Fallback for old data
          ],
        },
      ],
    };
    
    console.log("🔔 Finding pending invitations for userId:", userId, "Query:", JSON.stringify(query));

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$userId" }],
                },
              },
            },
          ],
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "projects",
          let: { projectId: "$projectId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$projectId" }],
                },
              },
            },
          ],
          as: "projectInfo",
        },
      },
      {
        $unwind: {
          path: "$projectInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          projectId: { $toString: "$projectId" },
          userId: { $toString: "$userId" },
          teamIds: 1,
          role: 1,
          isPending: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            $cond: {
              if: { $ne: ["$userInfo", null] },
              then: {
                id: { $toString: "$userInfo._id" },
                email: "$userInfo.email",
                fullName: "$userInfo.fullName",
                avatar: "$userInfo.avatar",
              },
              else: null,
            },
          },
          project: {
            $cond: {
              if: { $ne: ["$projectInfo", null] },
              then: {
                id: { $toString: "$projectInfo._id" },
                name: "$projectInfo.name",
                key: "$projectInfo.key",
                description: "$projectInfo.description",
              },
              else: null,
            },
          },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    console.log("🔔 Found pending invitations:", results.length, "for userId:", userId);
    return results as ProjectMemberWithDetails[];
  }
}

export default new ProjectMemberRepository();
