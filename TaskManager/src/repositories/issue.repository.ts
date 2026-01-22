import { Issue } from "@/models/issue.model";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";

export class IssueRepository {
  private collectionName = "issues";

  async getNextIssueNumber(projectId: string): Promise<number> {
    const db = await connectMongo();
    const latest = await db
      .collection(this.collectionName)
      .find({ projectId: new ObjectId(projectId) })
      .sort({ key: -1 })
      .limit(1)
      .toArray();

    if (latest.length === 0) return 1;

    const lastKey = latest[0]!.key; // e.g., "PROJ-123"
    const match = lastKey.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) + 1 : 1;
  }

  async findAll(filters: any = {}, page: number = 1, limit: number = 10) {
    const db = await connectMongo();
    const skip = (page - 1) * limit;

    const mongoFilter: any = {};
    if (filters.projectId) mongoFilter.projectId = new ObjectId(filters.projectId);
    if (filters.columnId) mongoFilter.columnId = new ObjectId(filters.columnId);
    if (filters.assigneeId) mongoFilter.assigneeId = new ObjectId(filters.assigneeId);

    const data = await db.collection(this.collectionName).find(mongoFilter).skip(skip).limit(limit).toArray();
    const total = await db.collection(this.collectionName).countDocuments(mongoFilter);

    const mapped = data.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      key: doc.key,
      summary: doc.summary,
      description: doc.description,
      storyPoint: doc.storyPoint,
      type: doc.type,
      priority: doc.priority,
      projectId: doc.projectId.toString(),
      sprintId: doc.sprintId?.toString(),
      columnId: doc.columnId.toString(),
      creatorId: doc.creatorId?.toString(),
      reporterId: doc.reporterId.toString(),
      assigneeId: doc.assigneeId?.toString(),
      parentId: doc.parentId?.toString(),
      teamId: doc.teamId?.toString(),
      attachments: doc.attachments || [],
      dueDateFrom: doc.dueDateFrom,
      dueDateTo: doc.dueDateTo,
      completedAt: doc.completedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return {
      data: mapped,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async findOne({ id }: { id: string }) {
    const db = await connectMongo();
    const doc = await db.collection(this.collectionName).findOne({ _id: new ObjectId(id) });
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      title: doc.title,
      key: doc.key,
      summary: doc.summary,
      description: doc.description,
      storyPoint: doc.storyPoint,
      type: doc.type,
      priority: doc.priority,
      projectId: doc.projectId.toString(),
      sprintId: doc.sprintId?.toString(),
      columnId: doc.columnId.toString(),
      creatorId: doc.creatorId?.toString(),
      reporterId: doc.reporterId.toString(),
      assigneeId: doc.assigneeId?.toString(),
      parentId: doc.parentId?.toString(),
      teamId: doc.teamId?.toString(),
      attachments: doc.attachments || [],
      dueDateFrom: doc.dueDateFrom,
      dueDateTo: doc.dueDateTo,
      completedAt: doc.completedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(issueData: Omit<Issue, "id" | "createdAt" | "updatedAt" | "key">, projectKey: string) {
    const db = await connectMongo();

    const nextNum = await this.getNextIssueNumber(issueData.projectId);
    const key = `${projectKey}-${nextNum}`;

    const doc: any = {
      ...issueData,
      key,
      projectId: new ObjectId(issueData.projectId),
      columnId: new ObjectId(issueData.columnId),
      reporterId: new ObjectId(issueData.reporterId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optional fields
    if (issueData.sprintId) doc.sprintId = new ObjectId(issueData.sprintId);
    if (issueData.creatorId) doc.creatorId = new ObjectId(issueData.creatorId);
    if (issueData.assigneeId) doc.assigneeId = new ObjectId(issueData.assigneeId);
    if (issueData.parentId) doc.parentId = new ObjectId(issueData.parentId);
    if (issueData.teamId) doc.teamId = new ObjectId(issueData.teamId);
    if (issueData.dueDateFrom) doc.dueDateFrom = new Date(issueData.dueDateFrom);
    if (issueData.dueDateTo) doc.dueDateTo = new Date(issueData.dueDateTo);
    if (issueData.completedAt) doc.completedAt = new Date(issueData.completedAt);

    const result = await db.collection(this.collectionName).insertOne(doc);
    return {
      id: result.insertedId.toString(),
      key,
      ...issueData,
    };
  }

  async update(id: string, updateData: Record<string, any>) {
    const db = await connectMongo();
    const updateDoc: any = { updatedAt: new Date() };

    const objectIdFields = ["columnId", "sprintId", "assigneeId", "parentId", "teamId", "creatorId", "reporterId"];

    const dateFields = ["dueDateFrom", "dueDateTo", "completedAt"];

    for (const key in updateData) {
      const value = updateData[key];
      if (value === undefined || value === null) continue;

      if (objectIdFields.includes(key)) {
        updateDoc[key] = new ObjectId(value);
      } else if (dateFields.includes(key)) {
        updateDoc[key] = new Date(value);
      } else {
        updateDoc[key] = value;
      }
    }

    const result = await db
      .collection(this.collectionName)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateDoc }, { returnDocument: "after" });

    if (!result?.value) return null;

    const doc = result.value;
    return {
      id: doc._id.toString(),
      title: doc.title,
      key: doc.key,
      summary: doc.summary,
      description: doc.description,
      storyPoint: doc.storyPoint,
      type: doc.type,
      priority: doc.priority,
      projectId: doc.projectId.toString(),
      sprintId: doc.sprintId?.toString(),
      columnId: doc.columnId.toString(),
      creatorId: doc.creatorId?.toString(),
      reporterId: doc.reporterId.toString(),
      assigneeId: doc.assigneeId?.toString(),
      parentId: doc.parentId?.toString(),
      teamId: doc.teamId?.toString(),
      attachments: doc.attachments || [],
      dueDateFrom: doc.dueDateFrom,
      dueDateTo: doc.dueDateTo,
      completedAt: doc.completedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async delete(id: string) {
    const db = await connectMongo();
    const result = await db.collection(this.collectionName).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

export default new IssueRepository();
