// src/repositories/project-column.repository.ts
import { MongoClient, Db, Collection } from "mongodb";
import { connectMongo } from "@/config/mongodb";
import { ProjectColumn } from "@/models/project.model";
import { ObjectId } from "mongodb";

class ProjectColumnRepository {
  private db: Db | null = null;
  private collection: Collection<ProjectColumn> | null = null;

  private async getCollection(): Promise<Collection<ProjectColumn>> {
    if (!this.collection) {
      this.db = await connectMongo();
      this.collection = this.db.collection<ProjectColumn>("project_columns");

      // Create indexes for better performance
      await this.collection.createIndex({ projectId: 1 });
      await this.collection.createIndex({ projectId: 1, order: 1 });
      await this.collection.createIndex({ projectId: 1, name: 1 }, { unique: true });
    }
    return this.collection;
  }

  async create(columnData: Omit<ProjectColumn, "id" | "issueIds">): Promise<ProjectColumn> {
    const collection = await this.getCollection();

    const column: ProjectColumn = {
      ...columnData,
      issueIds: [], // Start with empty issues array
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(column);
    return { ...column, id: result.insertedId.toString() };
  }

  async findByProject(projectId: string): Promise<ProjectColumn[]> {
    const collection = await this.getCollection();
    const columns = await collection.find({ projectId }).sort({ order: 1 }).toArray();

    return columns.map((column) => ({
      ...column,
      id: column._id?.toString(),
    }));
  }

  async findById(columnId: string): Promise<ProjectColumn | null> {
    const collection = await this.getCollection();
    const column = await collection.findOne({ _id: new ObjectId(columnId) } as any);

    if (!column) return null;

    return {
      ...column,
      id: column._id?.toString(),
    };
  }

  async findByProjectAndName(projectId: string, name: string): Promise<ProjectColumn | null> {
    const collection = await this.getCollection();
    const column = await collection.findOne({ projectId, name });

    if (!column) return null;

    return {
      ...column,
      id: column._id?.toString(),
    };
  }

  async update(columnId: string, updateData: Partial<ProjectColumn>): Promise<ProjectColumn | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(columnId) } as any,
      {
        $set: {
          ...updateData,
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

  async updateOrder(columnId: string, newOrder: number): Promise<ProjectColumn | null> {
    return this.update(columnId, { order: newOrder });
  }

  async delete(columnId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(columnId) } as any);
    return result.deletedCount > 0;
  }

  async getMaxOrder(projectId: string): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ projectId }, { sort: { order: -1 } });
    return result ? result.order : 0;
  }

  async reorderColumns(projectId: string, columnOrders: { columnId: string; order: number }[]): Promise<void> {
    const collection = await this.getCollection();

    const bulkOps = columnOrders.map(({ columnId, order }) => ({
      updateOne: {
        filter: { _id: new ObjectId(columnId) },
        update: { $set: { order, updatedAt: new Date() } },
      },
    }));

    await collection.bulkWrite(bulkOps);
  }

  async addIssueToColumn(columnId: string, issueId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(columnId) } as any, {
      $addToSet: { issueIds: issueId },
      $set: { updatedAt: new Date() },
    });
  }

  async removeIssueFromColumn(columnId: string, issueId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(columnId) } as any, {
      $pull: { issueIds: issueId },
      $set: { updatedAt: new Date() },
    });
  }

  async moveIssueBetweenColumns(fromColumnId: string, toColumnId: string, issueId: string): Promise<void> {
    const collection = await this.getCollection();

    // Remove from source column and add to target column in a single transaction
    const session = this.db?.client.startSession();
    if (!session) {
      throw new Error("Failed to start a session. Database connection is not initialized.");
    }

    try {
      await session.withTransaction(async () => {
        await collection.updateOne(
          { _id: new ObjectId(fromColumnId) },
          {
            $pull: { issueIds: issueId },
            $set: { updatedAt: new Date() },
          },
          { session }
        );

        await collection.updateOne(
          { _id: new ObjectId(toColumnId) },
          {
            $addToSet: { issueIds: issueId },
            $set: { updatedAt: new Date() },
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async getColumnWithIssueCount(projectId: string): Promise<Array<ProjectColumn & { issueCount: number }>> {
    const collection = await this.getCollection();

    const pipeline = [
      { $match: { projectId } },
      {
        $addFields: {
          issueCount: { $size: "$issueIds" },
        },
      },
      { $sort: { order: 1 } },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results.map((result) => ({
      ...result,
      id: result._id?.toString(),
    })) as Array<ProjectColumn & { issueCount: number }>;
  }
}

export default new ProjectColumnRepository();
