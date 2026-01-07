// src/dtos/user/CreateUser.dto.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2).max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["user", "admin", "super_admin"]),
  avatar: z.string().nullable().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
