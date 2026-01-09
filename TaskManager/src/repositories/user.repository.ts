import { User } from "@/models/user.model";

import { NotFoundError } from "@/utils/errors";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";
import { UserQueryParams } from "@/types/query-param";

export class UserRepository {
  private collectionName = "users";

  async findAll(input: UserQueryParams) {
    const db = await connectMongo();
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (input.userId) filter._id = new ObjectId(input.userId);
    if (input.email) filter.email = input.email;
    if (input.fullName) filter.firstName = input.fullName;
    if (input.role) filter.role = input.role;

    const data = await db.collection(this.collectionName).find(filter).skip(skip).limit(limit).toArray();

    const total = await db.collection(this.collectionName).countDocuments(filter);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(input: UserQueryParams) {
    const db = await connectMongo();
    const filter: any = {};
    if (input.userId) filter._id = new ObjectId(input.userId);
    if (input.email) filter.email = input.email;

    const user = await db.collection(this.collectionName).findOne(filter);
    console.log("findOne filter:", JSON.stringify(filter, null, 2));
    return user;
  }

  async create(input: { userData: Omit<User, "id"> }) {
    const db = await connectMongo();

    const doc: any = {};
    for (const key in input.userData) {
      if (input.userData[key as keyof User] !== undefined) {
        doc[key] = input.userData[key as keyof User];
      }
    }
    const result = await db.collection(this.collectionName).insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async update(input: { userId: string; userData: Partial<User> }) {
    const db = await connectMongo();

    const updateData = {
      ...input.userData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection(this.collectionName)
      .findOneAndUpdate({ _id: new ObjectId(input.userId) }, { $set: updateData }, { returnDocument: "after" });

    if (!result?.value) {
      const existingUser = await db.collection(this.collectionName).findOne({
        _id: new ObjectId(input.userId),
      });

      if (existingUser) {
        return existingUser;
      }

      throw new NotFoundError({ message: `User with ID ${input.userId} not found` });
    }

    return result.value;
  }

  async delete(userId: string) {
    const db = await connectMongo();
    const result = await db.collection(this.collectionName).findOneAndDelete({ _id: new ObjectId(userId) });
    if (!result || !result.value) {
      throw new NotFoundError({ message: `User with ID ${userId} not found` });
    }
    return result.value;
  }
}

export default new UserRepository();
