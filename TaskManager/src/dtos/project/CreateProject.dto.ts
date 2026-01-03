import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z]+$/),
  access: z.enum(["public", "private"]),
  type: z.enum(["scrum", "kanban"]),
});
