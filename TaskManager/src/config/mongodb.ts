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
  // Nếu đã có connection, return luôn
  if (client && db) {
    return db;
  }

  // Tạo client mới với connection pooling
  client = new MongoClient(uri!, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  db = client.db(dbName!);
  logger.info("Connected to MongoDB via native driver");

  // Connect Mongoose nếu chưa connect
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri!, {
      dbName: dbName!,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info("Connected to MongoDB via Mongoose");
  }

  return db;
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info("Disconnected from MongoDB (native driver)");
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB (Mongoose)");
  }
}
