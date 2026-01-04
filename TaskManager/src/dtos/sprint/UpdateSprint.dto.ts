import { z } from "zod";

export const updateSprintSchema = z.object({
  name: z.string().min(1).optional(),
  dateStarted: z.string().min(1).optional(),
  dateEnded: z.string().min(1).optional(),
  goal: z.string().optional(),
});
