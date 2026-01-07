// src/dtos/user/UpdateUser.dto.ts
import { z } from "zod";

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    email: z.string().email("Invalid email address").optional(),
    avatar: z.string().nullable().optional(),

    timezone: z.string().nullable().optional(),
    language: z.enum(["en", "es", "fr", "de", "ja", "ko", "zh"]).nullable().optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        projectUpdates: z.boolean().optional(),
        issueAssignments: z.boolean().optional(),
      })
      .nullable()
      .optional(),
    role: z.enum(["user", "admin", "super_admin"]).optional(),
    // Note: updated_at is managed internally, not from client
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
