import { z } from "zod";

export const updateSprintSchema = z.object({
  name: z.string().min(1).optional(),
  dateStarted: z.string().datetime().optional(),
  dateEnded: z.string().datetime().optional(),
  goal: z.string().optional(),
});
