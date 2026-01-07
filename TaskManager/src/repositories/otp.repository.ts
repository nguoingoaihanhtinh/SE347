// src/repositories/otp.repository.ts
import { Db, Collection, Int32 } from "mongodb";
import { connectMongo } from "@/config/mongodb";
import { OtpToken } from "@/models/otp-token.model";
import { ObjectId } from "mongodb";

class OtpRepository {
  private db: Db | null = null;
  private collection: Collection | null = null;

  private async getCollection(): Promise<Collection> {
    if (!this.collection) {
      this.db = await connectMongo();
      this.collection = this.db.collection("otp_tokens");

      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
    return this.collection;
  }

  async create(otpData: Omit<OtpToken, "id">): Promise<OtpToken> {
    const collection = await this.getCollection();
    const now = new Date();

    const dbDoc = {
      userId: new ObjectId(otpData.userId!),
      otpHash: otpData.otpHash,
      salt: otpData.salt,
      expiresAt: otpData.expiresAt,
      attemptCount: new Int32(otpData.attemptCount),
      maxAttempts: new Int32(otpData.maxAttempts),
      resendCount: new Int32(otpData.resendCount),
      resendWindowStart: otpData.resendWindowStart,
      canResendAfter: otpData.canResendAfter,
      createdAt: now,
      updatedAt: now,
    };
    console.log("Inserting OTP doc:", JSON.stringify(dbDoc, null, 2));
    console.log("Keys:", Object.keys(dbDoc));
    const result = await collection.insertOne(dbDoc);

    return {
      id: result.insertedId.toString(),
      userId: otpData.userId,
      otpHash: otpData.otpHash,
      salt: otpData.salt,
      expiresAt: otpData.expiresAt,
      attemptCount: otpData.attemptCount,
      maxAttempts: otpData.maxAttempts,
      resendCount: otpData.resendCount,
      resendWindowStart: otpData.resendWindowStart,
      canResendAfter: otpData.canResendAfter,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findByUserId(userId: string): Promise<OtpToken | null> {
    const collection = await this.getCollection();
    const otpToken = await collection.findOne({
      userId: new ObjectId(userId),
      expiresAt: { $gt: new Date() },
    });

    if (!otpToken) return null;

    return {
      id: otpToken._id.toString(),
      userId,
      otpHash: otpToken.otpHash,
      salt: otpToken.salt,
      expiresAt: otpToken.expiresAt,
      attemptCount: otpToken.attemptCount,
      maxAttempts: otpToken.maxAttempts,
      resendCount: otpToken.resendCount,
      resendWindowStart: otpToken.resendWindowStart,
      canResendAfter: otpToken.canResendAfter,
      createdAt: otpToken.createdAt,
      updatedAt: otpToken.updatedAt,
    };
  }

  async updateAttemptCount(userId: string, attemptCount: number): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ userId: new ObjectId(userId) }, { $set: { attemptCount, updatedAt: new Date() } });
  }

  async updateResendData(userId: string, resendCount: number, canResendAfter: Date): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { resendCount, canResendAfter, updatedAt: new Date() } }
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteMany({ userId: new ObjectId(userId) });
  }

  async deleteExpired(): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({ expiresAt: { $lt: new Date() } });
    return result.deletedCount;
  }
}

export default new OtpRepository();
