import { Project } from "@/models/project.model";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";

export class ProjectRepository {
  private collectionName = "projects";

  async findAll(filters: any = {}, page: number = 1, limit: number = 10) {
    const db = await connectMongo();
    const skip = (page - 1) * limit;
    const mongoFilter: any = { ...filters };
    if (mongoFilter.ownerId) {
      mongoFilter.ownerId = new ObjectId(mongoFilter.ownerId);
    }
    const data = await db.collection(this.collectionName).find(mongoFilter).skip(skip).limit(limit).toArray();
    const total = await db.collection(this.collectionName).countDocuments(mongoFilter);
    const mappedData = data.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      key: doc.key,
      access: doc.access,
      type: doc.type,
      ownerId: doc.ownerId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    return {
      data: mappedData,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(filter: { id?: string; key?: string }) {
    const db = await connectMongo();
    const mongoFilter: any = {};
    if (filter.id) mongoFilter._id = new ObjectId(filter.id);
    if (filter.key) mongoFilter.key = filter.key;
    const doc = await db.collection(this.collectionName).findOne(mongoFilter);
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      key: doc.key,
      access: doc.access,
      type: doc.type,
      ownerId: doc.ownerId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    const db = await connectMongo();
    const doc = {
      name: projectData.name,
      key: projectData.key,
      access: projectData.access,
      type: projectData.type,
      ownerId: new ObjectId(projectData.ownerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(this.collectionName).insertOne(doc);
    return {
      id: result.insertedId.toString(),
      ...doc,
      ownerId: projectData.ownerId,
    };
  }

  async update(id: string, updateData: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) {
    const db = await connectMongo();
    const updateDoc: any = { ...updateData, updatedAt: new Date() };
    if (updateDoc.ownerId) updateDoc.ownerId = new ObjectId(updateDoc.ownerId);
    const result = await db
      .collection(this.collectionName)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateDoc }, { returnDocument: "after" });
    if (!result) return null;
    const doc = result;
    return {
      id: doc._id.toString(),
      name: doc.name,
      key: doc.key,
      access: doc.access,
      type: doc.type,
      ownerId: doc.ownerId.toString(),
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

export default new ProjectRepository();
