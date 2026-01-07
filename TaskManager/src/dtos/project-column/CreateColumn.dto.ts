// src/dtos/project-column/CreateColumn.dto.ts
import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50, "Column name must be 50 characters or less").trim(),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .optional(),
});

export type CreateColumnDto = z.infer<typeof createColumnSchema>;
