import "module-alias/register";
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
