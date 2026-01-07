import { login, register, getMe, verifyOtp, resendOtp } from "@/handlers/auth.handler";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", authenticate, getMe);

export default router;
