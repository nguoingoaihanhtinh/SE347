import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error("Missing required MongoDB environment variables: MONGODB_URI or MONGODB_DB");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (!client || !db) {
    client = new MongoClient(uri as string);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
