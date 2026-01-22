import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const { getProjectActivities } = require("@/handlers/activity.handler");
  return getProjectActivities(req, res).catch(next);
});

router.get("/new", async (req: Request, res: Response, next: NextFunction) => {
  const { getNewActivities } = require("@/handlers/activity.handler");
  return getNewActivities(req, res).catch(next);
});

export default router;
