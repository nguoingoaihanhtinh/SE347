import "dotenv/config";
// src/index.ts
import { createApp } from "./createApp";
import { env } from "./config/env";
import logger from "./utils/logger";

(async () => {
  const app = await createApp();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });
})();
