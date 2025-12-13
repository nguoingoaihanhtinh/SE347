// scripts/migrate-mongodb.ts
import dotenv from "dotenv";
dotenv.config();
import { connectMongo } from "../src/config/mongodb";
import { Db } from "mongodb";

async function createCollections(db: Db) {
  // 1. projects
  await db.createCollection("projects", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "key", "access", "type", "ownerId", "createdAt", "updatedAt"],
        properties: {
          name: { bsonType: "string", description: "must be a string" },
          key: {
            bsonType: "string",
            pattern: "^[A-Z]{2,10}$",
            description: "must be uppercase letters, 2-10 chars",
          },
          access: { enum: ["public", "private"] },
          type: { enum: ["scrum", "kanban"] },
          ownerId: { bsonType: "objectId" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 2. project_columns
  await db.createCollection("project_columns", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "projectId", "order", "createdAt", "updatedAt"],
        properties: {
          name: { bsonType: "string" },
          projectId: { bsonType: "objectId" },
          order: { bsonType: "int" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 3. sprints
  await db.createCollection("sprints", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "dateStarted", "dateEnded", "projectId", "createdAt", "updatedAt"],
        properties: {
          name: { bsonType: "string" },
          dateStarted: { bsonType: "date" },
          dateEnded: { bsonType: "date" },
          duration: { bsonType: "int" },
          goal: { bsonType: "string" },
          projectId: { bsonType: "objectId" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 4. issues
  await db.createCollection("issues", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "title",
          "projectId",
          "columnId",
          "reporterId",
          "key",
          "summary",
          "description",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          title: { bsonType: "string" },
          key: { bsonType: "string" },
          summary: { bsonType: "string" },
          description: { bsonType: "string" },
          storyPoint: { bsonType: "int", minimum: 0 },
          type: { enum: ["task", "story", "bug", "epic"] },
          priority: { enum: ["low", "medium", "high", "critical"] },
          projectId: { bsonType: "objectId" },
          sprintId: { bsonType: "objectId" },
          columnId: { bsonType: "objectId" },
          creatorId: { bsonType: "objectId" },
          reporterId: { bsonType: "objectId" },
          assigneeId: { bsonType: "objectId" },
          parentId: { bsonType: "objectId" },
          teamId: { bsonType: "objectId" },
          attachments: { bsonType: "array" },
          dueDateFrom: { bsonType: "date" },
          dueDateTo: { bsonType: "date" },
          completedAt: { bsonType: "date" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 5. project_teams
  await db.createCollection("project_teams", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "name", "createdAt", "updatedAt"],
        properties: {
          projectId: { bsonType: "objectId" },
          name: { bsonType: "string" },
          description: { bsonType: "string" },
          permissionKeys: { bsonType: "array" },
          memberIds: { bsonType: "array" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 6. permissions
  await db.createCollection("permissions", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["label", "resource", "action", "key"],
        properties: {
          label: { bsonType: "string" },
          description: { bsonType: "string" },
          resource: { bsonType: "string" },
          action: { bsonType: "string" },
          key: { bsonType: "string" },
        },
      },
    },
  });

  // 7. project_members
  await db.createCollection("project_members", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "userId", "role", "isPending", "createdAt", "updatedAt"],
        properties: {
          projectId: { bsonType: "objectId" },
          userId: { bsonType: "objectId" },
          role: { enum: ["admin", "member", "viewer"] },
          isPending: { bsonType: "bool" },
          teamIds: { bsonType: "array" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 8. comments
  await db.createCollection("comments", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["issueId", "userId", "content", "createdAt", "updatedAt"],
        properties: {
          issueId: { bsonType: "objectId" },
          userId: { bsonType: "objectId" },
          content: { bsonType: "string" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  // 9. activities
  await db.createCollection("activities", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "actionType", "createdAt", "updatedAt"],
        properties: {
          projectId: { bsonType: "objectId" },
          issueId: { bsonType: "objectId" },
          userId: { bsonType: "objectId" },
          userName: { bsonType: "string" },
          actionType: { bsonType: "string" },
          changes: { bsonType: "array" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });
}

async function createIndexes(db: Db) {
  // projects
  await db.collection("projects").createIndex({ key: 1 }, { unique: true });
  await db.collection("projects").createIndex({ ownerId: 1 });

  // project_columns
  await db.collection("project_columns").createIndex({ projectId: 1, order: 1 });

  // issues
  await db.collection("issues").createIndex({ projectId: 1 });
  await db.collection("issues").createIndex({ columnId: 1 });
  await db.collection("issues").createIndex({ assigneeId: 1 });
  await db.collection("issues").createIndex({ key: 1 }, { unique: true });

  // project_members
  await db.collection("project_members").createIndex({ projectId: 1, userId: 1 }, { unique: true });

  // comments
  await db.collection("comments").createIndex({ issueId: 1 });

  // activities
  await db.collection("activities").createIndex({ issueId: 1 });
  await db.collection("activities").createIndex({ projectId: 1 });
}

async function run() {
  console.log("Connecting to MongoDB...");
  const db = await connectMongo();

  console.log("Creating collections with schema validation...");
  await createCollections(db);

  console.log("Creating indexes...");
  await createIndexes(db);

  console.log("✅ MongoDB migration completed!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
