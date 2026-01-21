import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";
import logger from "../utils/logger";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) throw new Error("MONGODB_URI is required");
if (!dbName) throw new Error("MONGODB_DB is required");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (!client || !db) {
    client = new MongoClient(uri!, {
      dbName: dbName!,
      // tlsInsecure: true,
    } as any);

    await client.connect();
    db = client.db(dbName!);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri!, {
        dbName: dbName!,
        // tlsInsecure: true,
      } as any);
      logger.info("Connected to MongoDB via Mongoose");
    }
  }
  return db;
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB (Mongoose)");
  }
}
