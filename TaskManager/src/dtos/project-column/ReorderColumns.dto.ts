// src/dtos/project-column/ReorderColumns.dto.ts
import { z } from "zod";

export const reorderColumnsSchema = z.object({
  columnOrders: z
    .array(
      z.object({
        columnId: z.string().min(1, "Column ID is required"),
        order: z.number().int().positive("Order must be a positive integer"),
      })
    )
    .min(1, "At least one column order is required"),
});

export type ReorderColumnsDto = z.infer<typeof reorderColumnsSchema>;
