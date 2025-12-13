import { z } from "zod";

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z]+$/)
    .optional(),
  access: z.enum(["public", "private"]).optional(),
  type: z.enum(["scrum", "kanban"]).optional(),
});
