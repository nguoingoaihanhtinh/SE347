// Script to fix project_members collection schema validation
// Run this once to update the schema to use camelCase instead of snake_case

import { connectMongo } from "../config/mongodb";
import logger from "../utils/logger";

async function fixProjectMembersSchema() {
  try {
    const db = await connectMongo();
    const collection = db.collection("project_members");

    // Drop existing schema validation
    logger.info("Dropping existing schema validation...");
    await db.command({
      collMod: "project_members",
      validator: {},
    });

    // Create new schema validation with camelCase
    logger.info("Creating new schema validation with camelCase...");
    await db.command({
      collMod: "project_members",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["projectId", "userId", "role"],
          properties: {
            projectId: { bsonType: ["objectId", "string"] },
            userId: { bsonType: ["objectId", "string"] },
            role: { enum: ["owner", "admin", "member", "viewer"] },
            isPending: { bsonType: "bool" },
            status: { enum: ["active", "pending_invite", "pending_request"] },
            teamIds: { bsonType: "array" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    });

    // Update indexes to use camelCase
    logger.info("Updating indexes...");
    try {
      await collection.dropIndex("project_id_1_user_id_1");
    } catch (e) {
      logger.info("Old index doesn't exist, skipping...");
    }

    await collection.createIndex({ projectId: 1, userId: 1 }, { unique: true });
    await collection.createIndex({ projectId: 1 });
    await collection.createIndex({ userId: 1 });

    logger.info("✅ Schema validation updated successfully!");
    logger.info("Collection now uses camelCase fields: projectId, userId, isPending, status, createdAt, updatedAt");
  } catch (error: any) {
    logger.error("❌ Error fixing schema:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixProjectMembersSchema()
    .then(() => {
      logger.info("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Script failed:", error);
      process.exit(1);
    });
}

export default fixProjectMembersSchema;
