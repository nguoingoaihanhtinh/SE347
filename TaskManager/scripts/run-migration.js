#!/usr/bin/env node
// scripts/run-migration.js - Simple runner for migrations

const { exec } = require("child_process");
const path = require("path");

console.log("🚀 Starting database migration...");

// Run the TypeScript migration directly with ts-node
const migrationPath = path.join(__dirname, "migrate-schema-updates.ts");
const command = `npx ts-node "${migrationPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }

  if (stderr) {
    console.error("⚠️ Migration warnings:", stderr);
  }

  console.log(stdout);
  console.log("🎉 Migration completed successfully!");
});
