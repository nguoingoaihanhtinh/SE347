import { z } from "zod";

export const SendForgotOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type SendForgotOtpDto = z.infer<typeof SendForgotOtpSchema>;
