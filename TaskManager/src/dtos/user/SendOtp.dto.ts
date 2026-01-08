import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;

