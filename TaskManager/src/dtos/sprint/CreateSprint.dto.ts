import { z } from "zod";

export const createSprintSchema = z.object({
  name: z.string().min(1),
  dateStarted: z.string().datetime(),
  dateEnded: z.string().datetime(),
  goal: z.string().optional(),
  projectId: z.string().min(1),
});
