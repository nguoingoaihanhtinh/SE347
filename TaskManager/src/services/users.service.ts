// src/services/user.service.ts
import _ from "lodash";
import * as bcrypt from "bcrypt";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import userRepository from "@/repositories/user.repository";
import { CreateUserDto } from "@/dtos/user/CreateUser.dto";
import { UpdateUserDto } from "@/dtos/user/UpdateUser.dto";
import { LoginDto } from "@/dtos/user/Login.dto";

import { RegisterDto } from "@/dtos/user/Register.dto";
import { generateToken } from "@/utils/jwt.util";
import otpService from "@/services/otp.service";
import { UserQueryParams } from "@/types/query-param";

export class UserService {
  async login(input: { loginData: LoginDto }) {
    const { loginData } = input;

    const curUser = await userRepository.findOne({ email: loginData.email });
    if (!curUser) {
      throw new BadRequestError({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(loginData.password, curUser.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError({ message: "Invalid email or password" });
    }

    if (!curUser.isEmailVerified) {
      throw new BadRequestError({
        message: "Please verify your account first. Check your email for verification instructions.",
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
    const otpVerification = await otpService.verifyOtpByEmail(registerData.email, registerData.otp);
    if (!otpVerification.success) {
      throw new BadRequestError({ message: otpVerification.message });
    }

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

  async findOne(input: { userId: string }) {
    const user = await userRepository.findOne({ userId: input.userId });
    console.log("findOne user:", JSON.stringify(user, null, 2));
    if (!user) throw new NotFoundError({ message: `User with ID ${input.userId} not found` });
    return user;
  }

  async createUser(input: { userData: CreateUserDto }) {
    const { userData } = input;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await userRepository.create({
      userData: {
        email: userData.email,
        fullName: userData.fullName,
        passwordHash: hashedPassword,
        role: userData.role,
        avatar: userData.avatar ?? null,
        isEmailVerified: false,
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
}

export default new UserService();
