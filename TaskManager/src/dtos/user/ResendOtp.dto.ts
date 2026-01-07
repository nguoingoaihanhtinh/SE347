import { z } from "zod";

export const resendOtpSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
