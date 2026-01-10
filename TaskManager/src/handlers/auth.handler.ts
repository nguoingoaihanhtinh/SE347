import _ from "lodash";
import validate from "@/utils/validate";
import { Request, Response } from "express-serve-static-core";
import { loginSchema } from "@/dtos/user/Login.dto";
import UsersService from "@/services/users.service";
import { registerSchema } from "@/dtos/user/Register.dto";
import { verifyOtpSchema } from "@/dtos/user/VerifyOtp.dto";
import { resendOtpSchema } from "@/dtos/user/ResendOtp.dto";
import { sendOtpSchema } from "@/dtos/user/SendOtp.dto";
import { SendForgotOtpSchema } from "@/dtos/user/SendForgotOtp.dto";
import { ResetPasswordSchema } from "@/dtos/user/ResetPassword.dto";
import otpService from "@/services/otp.service";
import userRepository from "@/repositories/user.repository";

export async function login(req: Request, res: Response) {
  const loginData = validate.schema_validate(loginSchema, req.body);

  const { user, token } = await UsersService.login({ loginData });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function register(req: Request, res: Response) {
  const registerData = validate.schema_validate(registerSchema, req.body);

  const { user, token } = await UsersService.register({ registerData });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function getMe(req: Request, res: Response) {
  const user = await UsersService.findOne({ userId: req.user!.userId });

  res.status(200).json({
    success: true,
    data: user,
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const otpData = validate.schema_validate(verifyOtpSchema, req.body);

  const result = await UsersService.verifyOtp({
    userId: otpData.userId,
    otpCode: otpData.otpCode,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function resendOtp(req: Request, res: Response) {
  const resendData = validate.schema_validate(resendOtpSchema, req.body);

  const result = await UsersService.resendOtp({
    userId: resendData.userId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function sendOtp(req: Request, res: Response) {
  const sendOtpData = validate.schema_validate(sendOtpSchema, req.body);

  // Check if email already exists (for registration OTP)
  const existingUser = await userRepository.findOne({ email: sendOtpData.email });
  if (existingUser) {
    res.status(400).json({
      success: false,
      message: "Tài khoản đã tồn tại. Vui lòng đăng nhập.",
    });
    return;
  }

  const result = await otpService.sendOtpByEmail(sendOtpData.email);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

export async function sendForgotOtp(req: Request, res: Response) {
  const forgotData = validate.schema_validate(SendForgotOtpSchema, req.body);

  const result = await UsersService.sendForgotOtp({ data: forgotData });

  res.status(200).json({
    success: true,
    message: result.message,
    data: { email: result.email },
  });
}

export async function resetPassword(req: Request, res: Response) {
  const resetData = validate.schema_validate(ResetPasswordSchema, req.body);

  const result = await UsersService.resetPassword({ data: resetData });

  // Set cookie for auto-login
  if (result.token) {
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
      token: result.token,
    },
  });
}
