import { Sprint } from "@/models/sprint.model";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";

export class SprintRepository {
  private collectionName = "sprints";

  async findAllByProject(projectId: string, page: number = 1, limit: number = 10) {
    const db = await connectMongo();
    const skip = (page - 1) * limit;
    const filter = { projectId: new ObjectId(projectId) };

    const data = await db.collection(this.collectionName).find(filter).skip(skip).limit(limit).toArray();
    const total = await db.collection(this.collectionName).countDocuments(filter);

    const mapped = data.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      dateStarted: doc.dateStarted,
      dateEnded: doc.dateEnded,
      duration: doc.duration,
      goal: doc.goal,
      projectId: doc.projectId.toString(),
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
      name: doc.name,
      dateStarted: doc.dateStarted,
      dateEnded: doc.dateEnded,
      duration: doc.duration,
      goal: doc.goal,
      projectId: doc.projectId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(sprintData: Omit<Sprint, "id" | "createdAt" | "updatedAt" | "duration">) {
    const db = await connectMongo();

    const dateStarted = new Date(sprintData.dateStarted);
    const dateEnded = new Date(sprintData.dateEnded);
    const duration = Math.ceil((dateEnded.getTime() - dateStarted.getTime()) / (1000 * 3600 * 24));

    const doc = {
      name: sprintData.name,
      dateStarted,
      dateEnded,
      duration,
      goal: sprintData.goal,
      projectId: new ObjectId(sprintData.projectId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(this.collectionName).insertOne(doc);
    return {
      id: result.insertedId.toString(),
      ...doc,
      projectId: sprintData.projectId,
    };
  }

  async update(id: string, updateData: Partial<Sprint>) {
    const db = await connectMongo();
    const updateDoc: any = { ...updateData, updatedAt: new Date() };

    if (updateDoc.dateStarted || updateDoc.dateEnded) {
      const dateStarted = updateDoc.dateStarted ? new Date(updateDoc.dateStarted) : null;
      const dateEnded = updateDoc.dateEnded ? new Date(updateDoc.dateEnded) : null;
      if (dateStarted && dateEnded) {
        updateDoc.dateStarted = dateStarted;
        updateDoc.dateEnded = dateEnded;
        updateDoc.duration = Math.ceil((dateEnded.getTime() - dateStarted.getTime()) / (1000 * 3600 * 24));
      }
    }

    const result = await db
      .collection(this.collectionName)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateDoc }, { returnDocument: "after" });

    if (!result?.value) return null;
    const doc = result.value;
    return {
      id: doc._id.toString(),
      name: doc.name,
      dateStarted: doc.dateStarted,
      dateEnded: doc.dateEnded,
      duration: doc.duration,
      goal: doc.goal,
      projectId: doc.projectId.toString(),
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

export default new SprintRepository();
