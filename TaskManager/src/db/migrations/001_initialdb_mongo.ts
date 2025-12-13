// MongoDB migration script for initial schema (TypeScript)
import { MongoClient, Db } from "mongodb";

async function migrate(db: Db) {
  // Projects
  await db.createCollection("projects", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "key", "access", "type", "owner_id", "created_at", "updated_at"],
        properties: {
          name: { bsonType: "string" },
          key: { bsonType: "string", pattern: "^[A-Z]{2,10}$" },
          access: { enum: ["public", "private"] },
          type: { enum: ["scrum", "kanban"] },
          owner_id: { bsonType: "objectId" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });
  await db.collection("projects").createIndex({ key: 1 }, { unique: true });

  // Project Columns
  await db.createCollection("project_columns", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "project_id", "order", "created_at", "updated_at"],
        properties: {
          name: { bsonType: "string" },
          project_id: { bsonType: "objectId" },
          order: { bsonType: "int" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });

  // Sprints
  await db.createCollection("sprints", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "date_started", "date_ended", "project_id", "created_at", "updated_at"],
        properties: {
          name: { bsonType: "string" },
          date_started: { bsonType: "date" },
          date_ended: { bsonType: "date" },
          goal: { bsonType: "string" },
          project_id: { bsonType: "objectId" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });

  // Issues
  await db.createCollection("issues", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "key", "project_id", "column_id", "reporter_id", "created_at", "updated_at"],
        properties: {
          title: { bsonType: "string" },
          key: { bsonType: "string" },
          summary: { bsonType: "string" },
          description: { bsonType: "string" },
          story_point: { bsonType: "int" },
          type: { enum: ["task", "story", "bug", "epic"] },
          priority: { enum: ["low", "medium", "high", "critical"] },
          project_id: { bsonType: "objectId" },
          sprint_id: { bsonType: "objectId" },
          column_id: { bsonType: "objectId" },
          creator_id: { bsonType: "objectId" },
          reporter_id: { bsonType: "objectId" },
          assignee_id: { bsonType: "objectId" },
          parent_id: { bsonType: "objectId" },
          team_id: { bsonType: "objectId" },
          attachments: { bsonType: "array" },
          due_date_from: { bsonType: "date" },
          due_date_to: { bsonType: "date" },
          completed_at: { bsonType: "date" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });
  await db.collection("issues").createIndex({ project_id: 1 });
  await db.collection("issues").createIndex({ column_id: 1 });
  await db.collection("issues").createIndex({ assignee_id: 1 });
  await db.collection("issues").createIndex({ key: 1, project_id: 1 }, { unique: true });

  // Project Teams
  await db.createCollection("project_teams", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["project_id", "name", "created_at", "updated_at"],
        properties: {
          project_id: { bsonType: "objectId" },
          name: { bsonType: "string" },
          description: { bsonType: "string" },
          permission_keys: { bsonType: "array" },
          member_ids: { bsonType: "array" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });

  // Permissions
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
  await db.collection("permissions").createIndex({ key: 1 }, { unique: true });

  // Project Members
  await db.createCollection("project_members", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["project_id", "user_id", "role", "is_pending", "created_at", "updated_at"],
        properties: {
          project_id: { bsonType: "objectId" },
          user_id: { bsonType: "objectId" },
          role: { enum: ["admin", "member", "viewer"] },
          is_pending: { bsonType: "bool" },
          team_ids: { bsonType: "array" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });
  await db.collection("project_members").createIndex({ project_id: 1, user_id: 1 }, { unique: true });

  // Comments
  await db.createCollection("comments", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["content", "issue_id", "user_id", "created_at", "updated_at"],
        properties: {
          content: { bsonType: "string" },
          issue_id: { bsonType: "objectId" },
          user_id: { bsonType: "objectId" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });

  // Activities
  await db.createCollection("activities", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["project_id", "action_type", "created_at", "updated_at"],
        properties: {
          project_id: { bsonType: "objectId" },
          issue_id: { bsonType: "objectId" },
          user_id: { bsonType: "objectId" },
          user_name: { bsonType: "string" },
          action_type: { bsonType: "string" },
          changes: { bsonType: "array" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" },
        },
      },
    },
  });
  await db.collection("activities").createIndex({ issue_id: 1 });
  await db.collection("activities").createIndex({ project_id: 1 });
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/taskmanager";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    await migrate(db);
    console.log("Migration completed successfully.");
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
