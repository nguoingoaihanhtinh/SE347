import { Db, Collection } from "mongodb";
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

      await this.collection.createIndex({ projectId: 1 });
      await this.collection.createIndex({ inviteeEmail: 1 });
      await this.collection.createIndex({ token: 1 }, { unique: true });
      await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await this.collection.createIndex({ status: 1 });
    }
    return this.collection;
  }

  private mapInvitation(invitation: any): ProjectInvitation {
    return {
      ...invitation,
      id: invitation._id?.toString(),
      projectId: invitation.projectId?.toString(),
      inviterUserId: invitation.inviterUserId?.toString(),
    };
  }

  async create(invitationData: Omit<ProjectInvitation, "id" | "_id">): Promise<ProjectInvitation> {
    const collection = await this.getCollection();

    const invitation: any = {
      ...invitationData,
      projectId: new ObjectId(invitationData.projectId),
      inviterUserId: new ObjectId(invitationData.inviterUserId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(invitation);
    return this.mapInvitation({
      ...invitation,
      _id: result.insertedId,
    });
  }

  async findByToken(token: string): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    console.log("Searching for token:", token); // Debugging log
    const invitation = await collection.findOne({ token });
    if (!invitation) {
      console.error("Token not found or expired:", token);
    }
    return invitation ? this.mapInvitation(invitation) : null;
  }

  async findByProject(projectId: string): Promise<ProjectInvitation[]> {
    const collection = await this.getCollection();
    const invitations = await collection.find({ projectId: new ObjectId(projectId) }).toArray();
    return invitations.map((inv) => this.mapInvitation(inv));
  }

  async findByEmail(email: string): Promise<ProjectInvitation[]> {
    const collection = await this.getCollection();
    const invitations = await collection.find({ inviteeEmail: email }).toArray();
    return invitations.map((inv) => this.mapInvitation(inv));
  }

  async findPendingByProjectAndEmail(projectId: string, email: string): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    const invitation = await collection.findOne({
      projectId: new ObjectId(projectId),
      inviteeEmail: email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    return invitation ? this.mapInvitation(invitation) : null;
  }

  async updateStatus(invitationId: string, status: ProjectInvitation["status"]): Promise<ProjectInvitation | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    return result ? this.mapInvitation(result) : null;
  }

  async deleteById(invitationId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(invitationId) });
    return result.deletedCount > 0;
  }

  async countPendingByProject(projectId: string): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({
      projectId: new ObjectId(projectId),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
  }
}

export default new ProjectInvitationRepository();
