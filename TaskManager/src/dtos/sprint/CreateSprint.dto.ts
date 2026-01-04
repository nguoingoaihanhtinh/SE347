import { z } from "zod";

export const createSprintSchema = z.object({
  name: z.string().min(1),
  dateStarted: z.string().min(1, "dateStarted is required"),
  dateEnded: z.string().min(1, "dateEnded is required"),
  goal: z.string().optional(),
  projectId: z.string().min(1),
});
