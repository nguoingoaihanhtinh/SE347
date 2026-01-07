import { z } from "zod";

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  otpCode: z
    .string()
    .min(6, "OTP code must be 6 digits")
    .max(6, "OTP code must be 6 digits")
    .regex(/^\d+$/, "OTP code must contain only numbers"),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
