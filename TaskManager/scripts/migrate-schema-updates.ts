// scripts/migrate-schema-updates.ts - Migration for model updates
import dotenv from "dotenv";
dotenv.config();
import { connectMongo } from "../src/config/mongodb";
import { Db } from "mongodb";

interface MigrationLog {
  version: string;
  appliedAt: Date;
  description: string;
}

async function ensureMigrationCollection(db: Db) {
  const collections = await db.listCollections({ name: "schema_migrations" }).toArray();
  if (collections.length === 0) {
    await db.createCollection("schema_migrations");
    console.log("✅ Created schema_migrations collection");
  }
}

async function isMigrationApplied(db: Db, version: string): Promise<boolean> {
  const migration = await db.collection("schema_migrations").findOne({ version });
  return !!migration;
}

async function recordMigration(db: Db, version: string, description: string) {
  await db.collection("schema_migrations").insertOne({
    version,
    description,
    appliedAt: new Date(),
  });
}

// --- USERS  ---
async function migrateUsers(db: Db) {
  console.log("🔄 Migrating users collection...");

  try {
    await db.collection("users").drop();
    console.log("  ↳ Dropped existing users collection");
  } catch {
    console.log("  ↳ Users collection doesn't exist, creating new one");
  }

  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "fullName", "passwordHash", "role", "isEmailVerified", "createdAt", "updatedAt"],
        properties: {
          email: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            description: "must be a valid email address",
          },
          fullName: {
            bsonType: "string",
            minLength: 2,
            maxLength: 100,
            description: "must be a string between 2-100 characters",
          },
          passwordHash: {
            bsonType: "string",
            description: "hashed password",
          },
          avatar: {
            bsonType: ["string", "null"],
            description: "avatar URL (optional)",
          },
          role: {
            enum: ["user", "admin", "super_admin"],
            description: "user system role",
          },
          isEmailVerified: {
            bsonType: "bool",
            description: "email verification status",
          },
          notifications: {
            bsonType: ["object", "null"],
            properties: {
              email: { bsonType: "bool" },
              push: { bsonType: "bool" },
              projectUpdates: { bsonType: "bool" },
              issueAssignments: { bsonType: "bool" },
            },
            description: "notification preferences",
          },
          lastLoginAt: {
            bsonType: ["date", "null"],
            description: "last login timestamp",
          },
          isActive: {
            bsonType: "bool",
            description: "account active status",
          },
          deactivatedAt: {
            bsonType: ["date", "null"],
            description: "deactivation timestamp",
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ isEmailVerified: 1 });
  await db.collection("users").createIndex({ isActive: 1 });

  console.log("✅ Users collection migrated successfully");
}

// --- OTP TOKENS ---
async function migrateOtpTokens(db: Db) {
  console.log("🔄 Creating otp_tokens collection...");

  try {
    await db.collection("otp_tokens").drop();
  } catch {}

  await db.createCollection("otp_tokens", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "userId",
          "otpHash",
          "salt",
          "expiresAt",
          "attemptCount",
          "maxAttempts",
          "resendCount",
          "resendWindowStart",
          "canResendAfter",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          userId: { bsonType: "objectId" },
          otpHash: { bsonType: "string" },
          salt: { bsonType: "string" },
          expiresAt: { bsonType: "date" },
          attemptCount: { bsonType: "int" },
          maxAttempts: { bsonType: "int" },
          resendCount: { bsonType: "int" },
          resendWindowStart: { bsonType: "date" },
          canResendAfter: { bsonType: "date" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("otp_tokens").createIndex({ userId: 1 });
  await db.collection("otp_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  //   await db.collection("otp_tokens").createIndex({ otpCode: 1, userId: 1 });

  console.log("✅ OTP tokens collection created");
}
// --- Migrate Project ---
// Add this function to your migration file
async function migrateProjects(db: Db) {
  console.log("🔄 Creating projects collection...");

  try {
    await db.collection("projects").drop();
  } catch {}

  await db.createCollection("projects", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "key", "access", "type", "ownerId", "createdAt", "updatedAt"],
        properties: {
          name: {
            bsonType: "string",
            minLength: 1,
            maxLength: 100,
          },
          key: {
            bsonType: "string",
            minLength: 2,
            maxLength: 10,
            pattern: "^[A-Z]+$",
          },
          description: {
            bsonType: ["string", "null"],
            maxLength: 1000,
          },
          access: {
            enum: ["public", "private"],
          },
          type: {
            enum: ["scrum", "kanban"],
          },
          ownerId: {
            bsonType: "objectId",
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("projects").createIndex({ key: 1 }, { unique: true });
  await db.collection("projects").createIndex({ ownerId: 1 });
  await db.collection("projects").createIndex({ "members.userId": 1 });

  console.log("✅ Projects collection created");
}
// --- PROJECT INVITATIONS ---
async function migrateProjectInvitations(db: Db) {
  console.log("🔄 Creating project_invitations collection...");

  try {
    await db.collection("project_invitations").drop();
  } catch {}

  await db.createCollection("project_invitations", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "inviterUserId", "inviteeEmail", "role", "token", "status", "expiresAt", "createdAt"],
        properties: {
          projectId: { bsonType: "objectId" },
          inviterUserId: { bsonType: "objectId" },
          inviteeEmail: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
          role: { enum: ["admin", "member", "viewer"] },
          token: { bsonType: "string" },
          status: { enum: ["pending", "accepted", "declined", "expired"] },
          message: { bsonType: ["string", "null"] },
          expiresAt: { bsonType: "date" },
          acceptedAt: { bsonType: ["date", "null"] },
          createdAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("project_invitations").createIndex({ token: 1 }, { unique: true });
  await db.collection("project_invitations").createIndex({ projectId: 1, inviteeEmail: 1 });
  await db.collection("project_invitations").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("project_invitations").createIndex({ status: 1 });

  console.log("✅ Project invitations collection created");
}
// --- ACTIVITIES ---
async function migrateActivities(db: Db) {
  console.log("🔄 Creating activities collection...");

  try {
    await db.collection("activities").drop();
  } catch {}

  await db.createCollection("activities", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "issueId", "actionType", "createdAt", "updatedAt"],
        properties: {
          projectId: { bsonType: "objectId" },
          issueId: { bsonType: "objectId" },
          userId: { bsonType: ["objectId", "null"] },
          userName: { bsonType: ["string", "null"] },
          actionType: {
            bsonType: "string",
            enum: [
              "PROJECT_CREATED",
              "PROJECT_UPDATED",
              "PROJECT_DELETED",
              "ISSUE_CREATED",
              "ISSUE_UPDATED",
              "ISSUE_DELETED",
              "ISSUE_MOVED",
              "SPRINT_CREATED",
              "SPRINT_UPDATED",
              "SPRINT_DELETED",
              "COLUMN_CREATED",
              "COLUMN_UPDATED",
              "COLUMN_DELETED",
              "COLUMN_REORDERED",
              "MEMBER_INVITED",
              "MEMBER_JOINED",
              "MEMBER_LEFT",
              "MEMBER_REMOVED",
              "MEMBER_ROLE_UPDATED",
            ],
          },
          changes: {
            bsonType: ["array", "null"],
            items: { bsonType: "object" },
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("activities").createIndex({ projectId: 1 });
  await db.collection("activities").createIndex({ userId: 1 });
  await db.collection("activities").createIndex({ actionType: 1 });
  await db.collection("activities").createIndex({ createdAt: -1 });

  console.log("✅ Activities collection created");
}
// --- PROJECT MEMBERS ---
async function migrateProjectMembers(db: Db) {
  console.log("🔄 Creating project_members collection...");

  try {
    await db.collection("project_members").drop();
  } catch {}

  await db.createCollection("project_members", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["projectId", "userId", "role", "isPending", "createdAt", "updatedAt"],
        properties: {
          projectId: {
            bsonType: "string",
            description: "Project ID",
          },
          userId: {
            bsonType: "string",
            description: "User ID",
          },
          teamIds: {
            bsonType: "array",
            items: { bsonType: "string" },
            minItems: 0,
            description: "Team IDs array",
          },
          role: {
            enum: ["owner", "admin", "member", "viewer"],
            description: "Member role",
          },
          isPending: {
            bsonType: "bool",
            description: "Membership pending status",
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });

  await db.collection("project_members").createIndex({ projectId: 1 });
  await db.collection("project_members").createIndex({ userId: 1 });
  await db.collection("project_members").createIndex({ projectId: 1, userId: 1 }, { unique: true });

  console.log("✅ Project members collection created");
}
// --- PROJECT COLUMNS ---
async function migrateProjectColumns(db: Db) {
  console.log("🔄 Creating project_columns collection...");

  try {
    await db.collection("project_columns").drop();
  } catch {}

  // No schema validator needed for project_columns (optional fields)

  await db.collection("project_columns").createIndex({ projectId: 1 });
  await db.collection("project_columns").createIndex({ projectId: 1, order: 1 });
  await db.collection("project_columns").createIndex({ projectId: 1, name: 1 }, { unique: true });

  console.log("✅ Project columns collection created");
}
// --- EXISTING COLLECTIONS UPDATE (unchanged) ---
async function updateExistingCollections(db: Db) {
  console.log("🔄 Updating existing collections with new fields...");

  // Update project columns
  try {
    const columnsCount = await db.collection("project_columns").countDocuments();
    if (columnsCount > 0) {
      await db.collection("project_columns").updateMany(
        {
          $or: [{ description: { $exists: false } }, { color: { $exists: false } }, { issueIds: { $exists: false } }],
        },
        {
          $set: {
            description: null,
            color: null,
            issueIds: [],
          },
        }
      );
      console.log("  ↳ Updated project_columns with new fields");
    }
  } catch {
    console.log("  ↳ project_columns collection doesn't exist yet");
  }

  // Update projects
  try {
    const projectsCount = await db.collection("projects").countDocuments();
    if (projectsCount > 0) {
      await db.collection("projects").updateMany({ description: { $exists: false } }, { $set: { description: null } });
      console.log("  ↳ Updated projects with description field");
    }
  } catch {
    console.log("  ↳ projects collection doesn't exist yet");
  }

  // Update sprints
  try {
    const sprintsCount = await db.collection("sprints").countDocuments();
    if (sprintsCount > 0) {
      const sprintsWithOldFields = await db
        .collection("sprints")
        .find({
          $or: [{ dateStarted: { $exists: true } }, { dateEnded: { $exists: true } }],
        })
        .toArray();

      for (const sprint of sprintsWithOldFields) {
        const updates: any = {};
        const unset: any = {};

        if (sprint.dateStarted) {
          updates.startDate = sprint.dateStarted;
          unset.dateStarted = 1;
        }
        if (sprint.dateEnded) {
          updates.endDate = sprint.dateEnded;
          unset.dateEnded = 1;
        }
        if (!sprint.status) {
          updates.status = "planning";
        }

        const updateDoc: any = {};
        if (Object.keys(updates).length > 0) updateDoc.$set = updates;
        if (Object.keys(unset).length > 0) updateDoc.$unset = unset;

        if (Object.keys(updateDoc).length > 0) {
          await db.collection("sprints").updateOne({ _id: sprint._id }, updateDoc);
        }
      }

      await db.collection("sprints").updateMany({ status: { $exists: false } }, { $set: { status: "planning" } });
      console.log("  ↳ Updated sprints with new field names and status");
    }
  } catch {
    console.log("  ↳ sprints collection doesn't exist yet");
  }

  // Update issues
  try {
    const issuesCount = await db.collection("issues").countDocuments();
    if (issuesCount > 0) {
      const issuesWithOldFields = await db
        .collection("issues")
        .find({
          $or: [
            { storyPoint: { $exists: true } },
            { dueDateFrom: { $exists: true } },
            { dueDateTo: { $exists: true } },
          ],
        })
        .toArray();

      for (const issue of issuesWithOldFields) {
        const updates: any = {};
        const unset: any = {};

        if (issue.storyPoint !== undefined) {
          updates.storyPoints = issue.storyPoint;
          unset.storyPoint = 1;
        }
        if (issue.dueDateFrom) {
          updates.dueDate = issue.dueDateFrom;
          unset.dueDateFrom = 1;
        }
        if (issue.dueDateTo) {
          unset.dueDateTo = 1;
        }

        const updateDoc: any = {};
        if (Object.keys(updates).length > 0) updateDoc.$set = updates;
        if (Object.keys(unset).length > 0) updateDoc.$unset = unset;

        if (Object.keys(updateDoc).length > 0) {
          await db.collection("issues").updateOne({ _id: issue._id }, updateDoc);
        }
      }

      await db.collection("issues").updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { priority: { $exists: false } },
            { type: { $exists: false } },
            { labels: { $exists: false } },
          ],
        },
        {
          $set: {
            status: "open",
            priority: "medium",
            type: "task",
            labels: [],
          },
        }
      );

      console.log("  ↳ Updated issues with new field names and defaults");
    }
  } catch {
    console.log("  ↳ issues collection doesn't exist yet");
  }

  console.log("✅ Existing collections updated");
}

// --- ADDITIONAL INDEXES ---
async function createAdditionalIndexes(db: Db) {
  console.log("🔄 Creating additional indexes...");

  const indexOperations = [
    { collection: "project_columns", index: { projectId: 1, name: 1 } },
    { collection: "issues", index: { status: 1 } },
    { collection: "issues", index: { priority: 1 } },
    { collection: "issues", index: { type: 1 } },
    { collection: "issues", index: { dueDate: 1 } },
    { collection: "issues", index: { labels: 1 } },
    { collection: "activities", index: { actionType: 1 } },
    { collection: "activities", index: { createdAt: -1 } },
    { collection: "users", index: { fullName: "text" } as any },
    { collection: "users", index: { role: 1 } },
  ];

  for (const op of indexOperations) {
    try {
      await db.collection(op.collection).createIndex(op.index as any);
      console.log(`  ↳ Created index on ${op.collection}`);
    } catch {
      console.log(`  ↳ Index on ${op.collection} might already exist or collection doesn't exist`);
    }
  }

  console.log("✅ Additional indexes created");
}

// --- MAIN RUNNER ---
async function runMigration() {
  console.log("🚀 Starting schema migration...");

  const db = await connectMongo();
  await ensureMigrationCollection(db);

  const migrationVersion = "011_project_columns_and_schema_updates";

  if (await isMigrationApplied(db, migrationVersion)) {
    console.log("⏭️  Migration already applied, skipping...");
    process.exit(0);
  }

  try {
    await migrateUsers(db);
    await migrateOtpTokens(db);
    await migrateProjectInvitations(db);
    await updateExistingCollections(db);
    await createAdditionalIndexes(db);
    await migrateProjects(db);
    await migrateActivities(db);
    await migrateProjectMembers(db);
    await migrateProjectColumns(db);

    await recordMigration(db, migrationVersion, "Removed bio, timezone, and language from user schema");

    console.log("✅ All migrations completed successfully!");
    console.log("🎉 Your database is now up to date!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

export { runMigration };
