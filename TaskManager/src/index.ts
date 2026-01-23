// Conditionally load module-alias/register for production builds
// In dev mode, tsconfig-paths/register handles path resolution
// Only load module-alias when:
// 1. Running in production mode (NODE_ENV === 'production')
// 2. OR when code is running from dist folder (production build)
if (process.env.NODE_ENV === "production" || __dirname.includes("dist")) {
  try {
    require("module-alias/register");
  } catch (error) {
    // Silently fail if module-alias is not available (shouldn't happen in production)
    console.warn("Failed to load module-alias/register:", error);
  }
}

import "dotenv/config";
// src/index.ts
import { createApp } from "./createApp";
import { env } from "./config/env";
import logger from "./utils/logger";

(async () => {
  const app = await createApp();
  app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
})();
