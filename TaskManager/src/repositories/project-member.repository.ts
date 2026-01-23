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
    const collection = await this.getCollection();

    const member: ProjectMember = {
      ...memberData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("Creating project member doc:", JSON.stringify(member, null, 2));
    const result = await collection.insertOne(member);
    return { ...member, id: result.insertedId.toString() };
  }

  async findByProject(projectId: string): Promise<ProjectMember[]> {
    const collection = await this.getCollection();
    const members = await collection.find({ projectId }).toArray();
    console.log(`Found ${members.length} members for projectId ${projectId}`);
    return members.map((member) => ({
      ...member,
      id: member._id?.toString(),
    }));
  }

  async findByProjectWithUserDetails(projectId: string): Promise<ProjectMemberWithDetails[]> {
    const collection = await this.getCollection();
    const db = await connectMongo();

    const pipeline = [
      { $match: { projectId } },
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
          projectId: 1,
          userId: 1,
          teamIds: 1,
          role: 1,
          isPending: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            $cond: {
              if: { $ne: ["$userInfo", null] },
              then: {
                _id: { $toString: "$userInfo._id" },
                email: "$userInfo.email",
                firstName: "$userInfo.firstName",
                lastName: "$userInfo.lastName",
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
    const member = await collection.findOne({ 
      projectId: new ObjectId(projectId), 
      userId: new ObjectId(userId) 
    });
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
    const result = await collection.deleteOne({ projectId, userId });
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
    const members = await collection.find({ userId: new ObjectId(userId) }).toArray();
    return members.map((member) => ({
      ...member,
      id: member._id?.toString(),
      projectId: member.projectId?.toString() || member.projectId,
      userId: member.userId?.toString() || member.userId,
    }));
  }
}

export default new ProjectMemberRepository();
