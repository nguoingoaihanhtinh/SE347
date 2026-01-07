import _ from "lodash";
import validate from "@/utils/validate";
import { Request, Response } from "express-serve-static-core";
import { loginSchema } from "@/dtos/user/Login.dto";
import UsersService from "@/services/users.service";
import { registerSchema } from "@/dtos/user/Register.dto";
import { verifyOtpSchema } from "@/dtos/user/VerifyOtp.dto";
import { resendOtpSchema } from "@/dtos/user/ResendOtp.dto";

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

  const user = await UsersService.register({ registerData });

  res.status(200).json({
    success: true,
    data: user,
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
