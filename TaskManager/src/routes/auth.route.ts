import {
  login,
  register,
  getMe,
  verifyOtp,
  resendOtp,
  sendOtp,
  sendForgotOtp,
  resetPassword,
} from "@/handlers/auth.handler";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes (NO authentication required)
router.post("/login", login);
router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/send-forgot-otp", sendForgotOtp); // PUBLIC - Forgot password OTP
router.post("/reset-password", resetPassword); // PUBLIC - Reset password

// Protected routes (authentication required)
router.get("/me", authenticate, getMe);
// console.log("✅ Auth routes loaded");
export default router;
