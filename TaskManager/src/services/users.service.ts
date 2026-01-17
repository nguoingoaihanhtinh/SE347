// src/services/user.service.ts
import _ from "lodash";
import * as bcrypt from "bcrypt";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import userRepository from "@/repositories/user.repository";
import { CreateUserDto } from "@/dtos/user/CreateUser.dto";
import { UpdateUserDto } from "@/dtos/user/UpdateUser.dto";
import { LoginDto } from "@/dtos/user/Login.dto";

import { RegisterDto } from "@/dtos/user/Register.dto";
import { SendForgotOtpDto } from "@/dtos/user/SendForgotOtp.dto";
import { ResetPasswordDto } from "@/dtos/user/ResetPassword.dto";
import { generateToken } from "@/utils/jwt.util";
import otpService from "@/services/otp.service";
import { UserQueryParams } from "@/types/query-param";

export class UserService {
  async login(input: { loginData: LoginDto }) {
    const { loginData } = input;

    const curUser = await userRepository.findOne({ email: loginData.email });
    if (!curUser) {
      throw new BadRequestError({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isValidPassword = await bcrypt.compare(loginData.password, curUser.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (!curUser.isEmailVerified) {
      throw new BadRequestError({
        message: "Vui lòng xác thực email trước. Kiểm tra hộp thư để lấy mã xác thực.",
      });
    }

    const { passwordHash, ...user } = curUser;
    const token = generateToken({
      userId: user._id?.toString() ?? "",
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async register(input: { registerData: RegisterDto }) {
    const { registerData } = input;

    // Verify OTP first
    // const otpVerification = await otpService.verifyOtpByEmail(registerData.email, registerData.otp);
    // if (!otpVerification.success) {
    //   throw new BadRequestError({ message: otpVerification.message });
    // }

    const existingUser = await userRepository.findOne({ email: registerData.email });
    if (existingUser) {
      throw new BadRequestError({ message: `User with email ${registerData.email} already exists` });
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const fullName = `${registerData.first_name} ${registerData.last_name}`.trim();

    const newUser = await userRepository.create({
      userData: {
        email: registerData.email,
        fullName,
        passwordHash: hashedPassword,
        role: "user",
        isEmailVerified: true,
        // isEmailVerified: false,
        avatar: null,
        notifications: null,
        isActive: true,
        lastLoginAt: null,
        deactivatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    const token = generateToken({
      userId: newUser._id?.toString() ?? "",
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyOtp(input: { userId: string; otpCode: string }) {
    const { userId, otpCode } = input;

    const user = await userRepository.findOne({ userId: userId });
    if (!user) throw new NotFoundError({ message: "User not found" });
    if (user.isEmailVerified) throw new BadRequestError({ message: "Account is already verified" });

    const otpResult = await otpService.verifyOtp(userId, otpCode);
    if (!otpResult.success) throw new BadRequestError({ message: otpResult.message });

    const updatedUser = await userRepository.update({
      userId,
      userData: {
        isEmailVerified: true,
        updatedAt: new Date(),
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return {
      ...userWithoutPassword,
      message: "Account verified successfully",
    };
  }

  async resendOtp(input: { userId: string }) {
    const { userId } = input;

    const user = await userRepository.findOne({ userId: userId });
    if (!user) throw new NotFoundError({ message: "User not found" });
    if (user.isEmailVerified) throw new BadRequestError({ message: "Account is already verified" });

    const canResend = await otpService.canRequestOtp(userId);
    if (!canResend.canRequest) {
      const waitMinutes = Math.ceil((canResend.waitTime || 0) / 60);
      throw new BadRequestError({
        message: `Please wait ${waitMinutes} minutes before requesting another OTP`,
      });
    }

    const firstName = user.fullName.split(" ")[0];
    const otpResult = await otpService.generateAndSendOtp(userId, user.email, firstName);

    if (!otpResult.success) {
      throw new BadRequestError({ message: otpResult.message });
    }

    return { message: "OTP sent successfully" };
  }

  async findAll(input: UserQueryParams) {
    return await userRepository.findAll(input);
  }

  async countSuperAdmins(): Promise<number> {
    return await userRepository.countByRole("super_admin");
  }

  async findOne(input: { userId: string }) {
    const user = await userRepository.findOne({ userId: input.userId });
    console.log("findOne user:", JSON.stringify(user, null, 2));
    if (!user) throw new NotFoundError({ message: `User with ID ${input.userId} not found` });
    return user;
  }

  async createUser(input: { userData: CreateUserDto }) {
    const { userData } = input;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Allow admin to create pre-verified users (default: false)
    const isEmailVerified = userData.isEmailVerified ?? false;

    const newUser = await userRepository.create({
      userData: {
        email: userData.email,
        fullName: userData.fullName,
        passwordHash: hashedPassword,
        role: userData.role,
        avatar: userData.avatar ?? null,
        isEmailVerified, // Use the provided value or default to false
        notifications: null,
        isActive: true,
        lastLoginAt: null,
        deactivatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return newUser;
  }

  async updateUser(input: { userId: string; userData: UpdateUserDto }) {
    const { userId, userData } = input;
    const existingUser = await this.findOne({ userId });

    if (userData.email) {
      const userWithEmail = await userRepository.findOne({ email: userData.email });
      if (userWithEmail && userWithEmail._id?.toString() !== userId) {
        throw new BadRequestError({ message: "Email already exists" });
      }
    }

    const updateData = {
      ..._.pickBy(userData, (v) => v !== undefined),
      updatedAt: new Date(),
    };

    const updatedUser = await userRepository.update({ userId, userData: updateData });
    return updatedUser;
  }

  async deleteUser(userId: string) {
    const deletedUser = await userRepository.delete(userId);
    if (!deletedUser) throw new NotFoundError({ message: `User with ID ${userId} not found` });
    return deletedUser;
  }

  async sendForgotOtp(input: { data: SendForgotOtpDto }) {
    const { data } = input;
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user exists (opposite of register logic)
    const user = await userRepository.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundError({ message: "Không tìm thấy tài khoản với địa chỉ email này" });
    }

    const userId = user._id?.toString() ?? "";
    const firstName = user.fullName.split(" ")[0];

    // Generate and send OTP
    const otpResult = await otpService.generateAndSendForgotPasswordOtp(userId, normalizedEmail, firstName);

    if (!otpResult.success) {
      throw new BadRequestError({ message: otpResult.message });
    }

    return {
      message: "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn",
      email: normalizedEmail,
    };
  }

  async resetPassword(input: { data: ResetPasswordDto }) {
    const { data } = input;
    const normalizedEmail = data.email.toLowerCase().trim();

    console.log(`[DEBUG] Reset password request - Email: ${normalizedEmail}, OTP: ${data.otp}`);

    // Find user by email
    const user = await userRepository.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[DEBUG] User not found for email: ${normalizedEmail}`);
      throw new NotFoundError({ message: "Không tìm thấy tài khoản với địa chỉ email này" });
    }

    // Verify _id exists
    if (!user._id) {
      console.error(`[DEBUG] User found but _id is missing for email: ${normalizedEmail}`);
      console.error(`[DEBUG] User object:`, JSON.stringify(user, null, 2));
      throw new BadRequestError({ message: "User data is corrupted. Please contact support." });
    }

    const userId = user._id.toString();
    console.log(`[DEBUG] User found successfully:`);
    console.log(`  - ID: ${userId}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Has passwordHash: ${!!user.passwordHash}`);

    // Verify forgot password OTP
    const otpVerification = await otpService.verifyForgotPasswordOtp(normalizedEmail, data.otp);
    if (!otpVerification.success) {
      console.log(`[DEBUG] OTP verification failed: ${otpVerification.message}`);
      throw new BadRequestError({
        message: otpVerification.message,
      });
    }

    console.log(`[DEBUG] OTP verified successfully, updating password...`);

    // Hash new password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(data.newPassword, 10);
      console.log(`[DEBUG] Password hashed successfully. Hash length: ${hashedPassword.length}`);
    } catch (error) {
      console.error("CHI TIẾT LỖI HASH PASSWORD:", error);
      throw new BadRequestError({
        message: error instanceof Error ? error.message : "Failed to hash password",
      });
    }

    try {
      console.log(`[DEBUG] Attempting to update user ${userId} with new password hash...`);
      
      // Update password in database
      const updatedUser = await userRepository.update({
        userId,
        userData: {
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        },
      });

      console.log(`[DEBUG] Password updated successfully for user: ${userId}`);
      console.log(`[DEBUG] Updated user object:`, updatedUser ? "exists" : "null");
    } catch (error) {
      console.error("CHI TIẾT LỖI RESET PASSWORD:", error);
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      // Throw the original error message instead of generic message
      const errorMessage = error instanceof Error ? error.message : "Failed to update password in database";
      throw new BadRequestError({
        message: `Không thể cập nhật mật khẩu: ${errorMessage}`,
      });
    }

    // Auto-login: Generate token after successful password reset
    console.log(`[DEBUG] Generating access token for auto-login...`);
    const { passwordHash: _, ...userWithoutPassword } = user;
    const token = generateToken({
      userId: userId,
      email: user.email,
      role: user.role,
    });

    console.log(`[DEBUG] Token generated successfully for user: ${userId}`);

    return {
      message: "Mật khẩu đã được đặt lại thành công. Bạn đã được đăng nhập tự động.",
      token,
      user: userWithoutPassword,
    };
  }
}

export default new UserService();
