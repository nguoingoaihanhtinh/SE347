// src/repositories/project-invitation.repository.ts
import { MongoClient, Db, Collection } from "mongodb";
import { connectMongo } from "@/config/mongodb";
import { ProjectInvitation } from "@/models/project-member.model";
import { ObjectId } from "mongodb";

class ProjectInvitationRepository {
  private db: Db | null = null;
  private collection: Collection<ProjectInvitation> | null = null;

  private async getCollection(): Promise<Collection<ProjectInvitation>> {
    if (!this.collection) {
      this.db = await connectMongo();
      this.collection = this.db.collection<ProjectInvitation>("project_invitations");

      // Create indexes for better performance
      await this.collection.createIndex({ projectId: 1 });
      await this.collection.createIndex({ inviteeEmail: 1 });
      await this.collection.createIndex({ token: 1 }, { unique: true });
      await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
    return this.collection;
  }

  async create(invitationData: Omit<ProjectInvitation, "id" | "_id">): Promise<ProjectInvitation> {
    const collection = await this.getCollection();

    const invitation: ProjectInvitation = {
      ...invitationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(invitation);
    return { ...invitation, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  async findByToken(token: string): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    const invitation = await collection.findOne({ token });

    if (!invitation) return null;

    return {
      ...invitation,
      id: invitation._id?.toString(),
    };
  }

  async findByProject(projectId: string): Promise<ProjectInvitation[]> {
    const collection = await this.getCollection();
    const invitations = await collection.find({ projectId }).toArray();

    return invitations.map((invitation) => ({
      ...invitation,
      id: invitation._id?.toString(),
    }));
  }

  async findByEmail(email: string): Promise<ProjectInvitation[]> {
    const collection = await this.getCollection();
    const invitations = await collection.find({ inviteeEmail: email }).toArray();

    return invitations.map((invitation) => ({
      ...invitation,
      id: invitation._id?.toString(),
    }));
  }

  async findPendingByProjectAndEmail(projectId: string, email: string): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    const invitation = await collection.findOne({
      projectId,
      inviteeEmail: email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) return null;

    return {
      ...invitation,
      id: invitation._id?.toString(),
    };
  }

  async updateStatus(invitationId: string, status: ProjectInvitation["status"]): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(invitationId) } as any,
      {
        $set: {
          status,
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

  async deleteById(invitationId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(invitationId) } as any);
    return result.deletedCount > 0;
  }

  async deleteExpired(): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
      status: "pending",
    });
    return result.deletedCount;
  }

  async countPendingByProject(projectId: string): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({
      projectId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
  }
}

export default new ProjectInvitationRepository();
