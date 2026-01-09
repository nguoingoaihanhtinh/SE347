import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";
import logger from "../utils/logger";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error("Missing required MongoDB environment variables: MONGODB_URI or MONGODB_DB");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (!client || !db) {
    // Connect native MongoDB driver
    client = new MongoClient(uri as string);
    await client.connect();
    db = client.db(dbName);

    // Connect Mongoose
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri as string, {
        dbName: dbName,
      });
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
