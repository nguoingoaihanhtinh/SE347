import { Activity, ActivityChange } from "@/models/activity.model";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";

export class ActivityRepository {
  private collectionName = "activities";

  async create({
    projectId,
    issueId,
    userId,
    userName,
    actionType,
    changes = [],
  }: Omit<Activity, "id" | "createdAt" | "updatedAt">): Promise<Activity> {
    const db = await connectMongo();

    const doc: any = {
      projectId: new ObjectId(projectId),
      issueId: new ObjectId(issueId),
      actionType,
      changes: changes || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (userId) doc.userId = new ObjectId(userId);
    if (userName) doc.userName = userName;

    const result = await db.collection(this.collectionName).insertOne(doc);

    return {
      id: result.insertedId.toString(),
      projectId,
      issueId,
      userId,
      userName,
      actionType,
      changes: changes || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByProject(projectId: string, page = 1, limit = 20) {
    const db = await connectMongo();
    const skip = (page - 1) * limit;
    const filter = { projectId: new ObjectId(projectId) };

    // Thêm kiểm tra null safety
    const data = await db
      .collection(this.collectionName)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection(this.collectionName).countDocuments(filter);

    const mapped = data.map((doc) => ({
      id: doc._id?.toString() || "",
      projectId: doc.projectId?.toString() || projectId,
      issueId: doc.issueId?.toString() || "",
      userId: doc.userId?.toString() || null,
      userName: doc.userName || null,
      actionType: doc.actionType || "",
      changes: (doc.changes as ActivityChange[]) || [],
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    }));

    return {
      mapped,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async findNewSince(projectId: string, since: Date) {
    const db = await connectMongo();
    const filter = {
      projectId: new ObjectId(projectId),
      createdAt: { $gt: since },
    };

    const data = await db.collection(this.collectionName).find(filter).sort({ createdAt: -1 }).limit(20).toArray();

    const mapped = data.map((doc) => ({
      id: doc._id?.toString() || "",
      projectId: doc.projectId?.toString() || projectId,
      issueId: doc.issueId?.toString() || "",
      userId: doc.userId?.toString() || null,
      userName: doc.userName || null,
      actionType: doc.actionType || "",
      changes: (doc.changes as ActivityChange[]) || [],
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    }));

    return { mapped };
  }
}

export default new ActivityRepository();
