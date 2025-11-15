import { z } from "zod";

export const updateUserSchema = z
  .object({
    avatar: z.string().nullable().optional(),
    first_name: z.string().min(1, "First name is required").optional(),
    last_name: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["student", "company", "admin"]).optional(),
    updated_at: z.string().optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  );

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
