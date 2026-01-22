// src/scripts/seed.ts
import "dotenv/config";
import * as bcrypt from "bcrypt";
import { connectMongo, disconnectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";
import { User } from "@/models/user.model";
import { Project } from "@/models/project.model";
import { Sprint } from "@/models/sprint.model";
import { Issue, IssueType, IssuePriority } from "@/models/issue.model";
import { ProjectColumn } from "@/models/project.model";
import { ProjectMember } from "@/models/project.model";
import { TeamMemberRole } from "@/models/project-member.model";
import logger from "@/utils/logger";

// Configuration
const CONFIG = {
  CLEAN_DB: true, // Set to false to keep existing data
  SUPER_ADMIN_COUNT: 1,
  REGULAR_USER_COUNT: 200, // ~200 users for small business
  PROJECT_COUNT: 100, // ~100 projects
  SPRINTS_PER_PROJECT: 2, // 1-2 sprints per project
  ISSUES_PER_PROJECT: 10, // 5-10 issues per project
  MEMBERS_PER_PROJECT: 5, // Random 3-8 members per project
  SUPER_ADMIN_PASSWORD: "SuperAdmin@123456", // Strong password for Super Admin
  REGULAR_USER_PASSWORD: "User@123456", // Strong password for Regular Users
};

// Helper: Generate random Vietnamese names
const FIRST_NAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Võ", "Đặng", "Bùi", "Đỗ",
  "Hồ", "Ngô", "Dương", "Lý", "Vũ", "Đinh", "Phan", "Trương", "Cao", "Lương",
];

const MIDDLE_NAMES = [
  "Văn", "Thị", "Đức", "Minh", "Thanh", "Hữu", "Công", "Quang", "Đình", "Xuân",
  "Hồng", "Thu", "Lan", "Hương", "Anh", "Tuấn", "Duy", "Hoàng", "Bảo", "Gia",
];

const LAST_NAMES = [
  "An", "Bình", "Chi", "Dũng", "Giang", "Hạnh", "Khoa", "Lan", "Mai", "Nam",
  "Phong", "Quân", "Sơn", "Thảo", "Uyên", "Việt", "Yến", "Anh", "Bảo", "Cường",
  "Dương", "Đức", "Giang", "Hải", "Hùng", "Khang", "Linh", "Long", "Minh", "Nga",
];

function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] || "Nguyễn";
  const middleName = MIDDLE_NAMES[Math.floor(Math.random() * MIDDLE_NAMES.length)] || "Văn";
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)] || "An";
  return `${firstName} ${middleName} ${lastName}`;
}

function generateProjectKey(name: string): string {
  const words = name.split(" ");
  const initials = words.map((w) => w[0]?.toUpperCase() || "").join("");
  return initials.substring(0, 4) + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Hash password helper
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Clean Database
async function cleanDatabase() {
  if (!CONFIG.CLEAN_DB) {
    logger.info("Skipping database cleanup (CLEAN_DB = false)");
    return;
  }

  logger.info("🧹 Cleaning database...");
  const db = await connectMongo();

  const collections = [
    "users",
    "projects",
    "project_members",
    "project_columns",
    "sprints",
    "issues",
    "comments",
    "activities",
  ];

  for (const collectionName of collections) {
    const count = await db.collection(collectionName).countDocuments();
    if (count > 0) {
      await db.collection(collectionName).deleteMany({});
      logger.info(`  ✓ Deleted ${count} documents from ${collectionName}`);
    }
  }

  logger.info("✅ Database cleaned successfully");
}

// Create Users
async function createUsers(): Promise<string[]> {
  logger.info("👥 Creating users...");
  const db = await connectMongo();
  const superAdminPasswordHash = await hashPassword(CONFIG.SUPER_ADMIN_PASSWORD);
  const regularUserPasswordHash = await hashPassword(CONFIG.REGULAR_USER_PASSWORD);
  const userIds: string[] = [];

  // Create Super Admin
  for (let i = 0; i < CONFIG.SUPER_ADMIN_COUNT; i++) {
    const superAdmin: User = {
      email: `superadmin@company.com`,
      fullName: "Super Administrator",
      passwordHash: superAdminPasswordHash,
      avatar: null,
      role: "super_admin",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(superAdmin as any);
    userIds.push(result.insertedId.toString());
    logger.info(`  ✓ Created Super Admin: ${superAdmin.email}`);
  }

  // Create Regular Users
  const createdEmails = new Set<string>();
  for (let i = 0; i < CONFIG.REGULAR_USER_COUNT; i++) {
    let email: string;
    let fullName: string;

    // Ensure unique emails
    do {
      const name = generateRandomName();
      fullName = name;
      const emailName = name.toLowerCase().replace(/\s+/g, "");
      email = `${emailName}${i + 1}@company.com`;
    } while (createdEmails.has(email));

    createdEmails.add(email);

    const user: User = {
      email,
      fullName,
      passwordHash: regularUserPasswordHash,
      avatar: null,
      role: Math.random() > 0.9 ? "admin" : "user", // 10% are admins
      isEmailVerified: true,
      isActive: Math.random() > 0.05, // 95% are active
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user as any);
    userIds.push(result.insertedId.toString());

    if ((i + 1) % 50 === 0) {
      logger.info(`  ✓ Created ${i + 1}/${CONFIG.REGULAR_USER_COUNT} users...`);
    }
  }

  logger.info(`✅ Created ${userIds.length} users total`);
  return userIds;
}

// Create Projects
async function createProjects(userIds: string[]): Promise<string[]> {
  logger.info("📁 Creating projects...");
  const db = await connectMongo();
  const projectIds: string[] = [];

  const projectNames = [
    "Website Redesign",
    "Mobile App Development",
    "E-commerce Platform",
    "CRM System",
    "Analytics Dashboard",
    "API Integration",
    "Data Migration",
    "Security Audit",
    "Performance Optimization",
    "Feature Enhancement",
    "Bug Fix Sprint",
    "UI/UX Improvement",
    "Backend Refactoring",
    "Database Optimization",
    "Testing Framework",
    "Documentation Project",
    "Deployment Automation",
    "Monitoring System",
    "User Authentication",
    "Payment Gateway",
  ];

  for (let i = 0; i < CONFIG.PROJECT_COUNT; i++) {
    const name = `${getRandomItem(projectNames)} ${i + 1}`;
    const key = generateProjectKey(name);
    const ownerId = getRandomItem(userIds);
    const access = Math.random() > 0.3 ? "private" : "public"; // 70% private
    const type = Math.random() > 0.5 ? "scrum" : "kanban";

    const project: any = {
      name,
      key,
      description: `Project description for ${name}. This project involves various tasks and features.`,
      access,
      type,
      ownerId: new ObjectId(ownerId),
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date in past 6 months
      updatedAt: new Date(),
    };

    const result = await db.collection("projects").insertOne(project);
    const projectId = result.insertedId.toString();
    projectIds.push(projectId);

    // Create default columns for each project
    await createProjectColumns(projectId);

    if ((i + 1) % 20 === 0) {
      logger.info(`  ✓ Created ${i + 1}/${CONFIG.PROJECT_COUNT} projects...`);
    }
  }

  logger.info(`✅ Created ${projectIds.length} projects`);
  return projectIds;
}

// Create Project Columns
async function createProjectColumns(projectId: string): Promise<string[]> {
  const db = await connectMongo();
  const columnIds: string[] = [];

  const defaultColumns = [
    { name: "To Do", description: "Tasks that need to be done", color: "#6B7280", order: 1 },
    { name: "In Progress", description: "Tasks currently being worked on", color: "#3B82F6", order: 2 },
    { name: "Review", description: "Tasks ready for review", color: "#F59E0B", order: 3 },
    { name: "Done", description: "Completed tasks", color: "#10B981", order: 4 },
  ];

  for (const col of defaultColumns) {
    const column: any = {
      name: col.name,
      description: col.description,
      color: col.color,
      projectId: new ObjectId(projectId),
      issueIds: [],
      order: col.order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("project_columns").insertOne(column);
    columnIds.push(result.insertedId.toString());
  }

  return columnIds;
}

// Create Project Members
async function createProjectMembers(projectIds: string[], userIds: string[]): Promise<void> {
  logger.info("👤 Creating project members...");
  const db = await connectMongo();
  let totalMembers = 0;

  for (const projectId of projectIds) {
    const ownerId = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(projectId) })
      .then((doc) => doc?.ownerId?.toString());

    if (!ownerId) continue;

    // Add owner as project member
    const ownerMember: any = {
      projectId: new ObjectId(projectId),
      teamIds: [],
      userId: new ObjectId(ownerId),
      role: "owner",
      isPending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("project_members").insertOne(ownerMember);
    totalMembers++;

    // Add random members (3-8 per project)
    const memberCount = Math.floor(Math.random() * 6) + 3; // 3-8 members
    const availableUsers = userIds.filter((id) => id !== ownerId);
    const selectedUsers = getRandomItems(availableUsers, memberCount);

    for (const userId of selectedUsers) {
      const roles: TeamMemberRole[] = ["admin", "member", "viewer"];
      const role = getRandomItem(roles);

      const member: any = {
        projectId: new ObjectId(projectId),
        teamIds: [],
        userId: new ObjectId(userId),
        role,
        isPending: Math.random() > 0.8, // 20% pending
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("project_members").insertOne(member);
      totalMembers++;
    }
  }

  logger.info(`✅ Created ${totalMembers} project members`);
}

// Create Sprints
async function createSprints(projectIds: string[]): Promise<Map<string, string[]>> {
  logger.info("🏃 Creating sprints...");
  const db = await connectMongo();
  const sprintMap = new Map<string, string[]>(); // projectId -> sprintIds

  for (const projectId of projectIds) {
    const sprintIds: string[] = [];
    const sprintCount = Math.floor(Math.random() * CONFIG.SPRINTS_PER_PROJECT) + 1; // 1-2 sprints

    for (let i = 0; i < sprintCount; i++) {
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 90); // Random date in past 90 days
      const dateStarted = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const duration = 7 + Math.floor(Math.random() * 14); // 7-21 days
      const dateEnded = new Date(dateStarted.getTime() + duration * 24 * 60 * 60 * 1000);

      const sprint: any = {
        name: `Sprint ${i + 1}`,
        dateStarted,
        dateEnded,
        duration,
        goal: `Sprint goal for project ${projectId}`,
        projectId: new ObjectId(projectId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("sprints").insertOne(sprint);
      sprintIds.push(result.insertedId.toString());
    }

    sprintMap.set(projectId, sprintIds);
  }

  logger.info(`✅ Created sprints for ${sprintMap.size} projects`);
  return sprintMap;
}

// Create Issues
async function createIssues(
  projectIds: string[],
  userIds: string[],
  sprintMap: Map<string, string[]>
): Promise<void> {
  logger.info("📋 Creating issues...");
  const db = await connectMongo();
  let totalIssues = 0;

  for (const projectId of projectIds) {
    // Get project columns
    const columns = await db
      .collection("project_columns")
      .find({ projectId: new ObjectId(projectId) })
      .toArray();

    if (columns.length === 0) continue;

    const columnIds = columns.map((col) => col._id.toString());
    const sprintIds = sprintMap.get(projectId) || [];

    // Get project members
    const members = await db
      .collection("project_members")
      .find({ projectId: new ObjectId(projectId) })
      .toArray();
    const memberIds = members.map((m) => m.userId.toString());

    // Get project key for issue key generation
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
    const projectKey = project?.key || "PROJ";

    const issueCount = Math.floor(Math.random() * CONFIG.ISSUES_PER_PROJECT) + 5; // 5-15 issues

    for (let i = 0; i < issueCount; i++) {
      const issueNumber = i + 1;
      const key = `${projectKey}-${issueNumber}`;
      const types: IssueType[] = ["task", "story", "bug", "epic"];
      const priorities: IssuePriority[] = ["low", "medium", "high", "critical"];
      const statuses = ["To Do", "In Progress", "Review", "Done"];

      const type = getRandomItem(types);
      const priority = getRandomItem(priorities);
      const status = getRandomItem(statuses);

      // Find column by status name
      const column = columns.find((col) => col.name === status) || columns[0];
      if (!column || !column._id) {
        logger.warn(`  ⚠️  No column found for project ${projectId}, skipping issue`);
        continue;
      }
      const columnId = column._id.toString();

      const reporterId = getRandomItem(memberIds);
      const assigneeId = Math.random() > 0.3 ? getRandomItem(memberIds) : undefined; // 70% assigned
      const sprintId = sprintIds.length > 0 && Math.random() > 0.4 ? getRandomItem(sprintIds) : undefined; // 60% in sprint

      const issue: any = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${key}`,
        key,
        summary: `Summary for ${key}`,
        description: `Detailed description for issue ${key}. This is a ${type} with ${priority} priority.`,
        storyPoint: Math.floor(Math.random() * 13) + 1, // 1-13 story points
        type,
        priority,
        projectId: new ObjectId(projectId),
        sprintId: sprintId ? new ObjectId(sprintId) : undefined,
        columnId: new ObjectId(columnId),
        reporterId: new ObjectId(reporterId),
        assigneeId: assigneeId ? new ObjectId(assigneeId) : undefined,
        attachments: [],
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in past 60 days
        updatedAt: new Date(),
      };

      // If status is "Done", set completedAt
      if (status === "Done") {
        issue.completedAt = new Date(issue.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      }

      const issueResult = await db.collection("issues").insertOne(issue);
      totalIssues++;

      // Update column issueIds
      await db.collection("project_columns").updateOne(
        { _id: new ObjectId(columnId) },
        { $push: { issueIds: issueResult.insertedId } as any }
      );
    }
  }

  logger.info(`✅ Created ${totalIssues} issues`);
}

// Main Seed Function
async function seed() {
  try {
    logger.info("🌱 Starting database seeding...");
    logger.info(`Configuration: ${JSON.stringify(CONFIG, null, 2)}`);

    // Connect to database
    await connectMongo();
    logger.info("✅ Connected to MongoDB");

    // Clean database (if enabled)
    await cleanDatabase();

    // Create users
    const userIds = await createUsers();

    // Create projects
    const projectIds = await createProjects(userIds);

    // Create project members
    await createProjectMembers(projectIds, userIds);

    // Create sprints
    const sprintMap = await createSprints(projectIds);

    // Create issues
    await createIssues(projectIds, userIds, sprintMap);

    logger.info("🎉 Database seeding completed successfully!");
    logger.info(`📊 Summary:`);
    logger.info(`   - Users: ${userIds.length}`);
    logger.info(`   - Projects: ${projectIds.length}`);
    logger.info(`   - Sprints: ${Array.from(sprintMap.values()).flat().length}`);
    logger.info(``);
    logger.info(`🔐 Login Credentials:`);
    logger.info(`   Super Admin: superadmin@company.com / ${CONFIG.SUPER_ADMIN_PASSWORD}`);
    logger.info(`   Regular Users: [any email] / ${CONFIG.REGULAR_USER_PASSWORD}`);

    await disconnectMongo();
  } catch (error) {
    logger.error("❌ Error during seeding:", error);
    await disconnectMongo();
    process.exit(1);
  }
}

// Run seed
seed();
