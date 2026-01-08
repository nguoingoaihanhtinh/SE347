// src/services/otp.service.ts
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "@/config/env";
import otpRepository from "@/repositories/otp.repository";
import emailService from "@/services/email.service";
import { OtpToken } from "@/models/otp-token.model";
import { Otp } from "@/models/otp.model";
import logger from "@/utils/logger";

export interface OtpGenerationResult {
  success: boolean;
  message: string;
  canResendAfter?: Date;
}

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}

class OtpService {
  private readonly OTP_SALT_ROUNDS = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly MAX_RESENDS_PER_HOUR = 3;
  private readonly RESEND_COOLDOWN_MINUTES = 1;

  private generateOtpCode(): string {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < env.OTP_LENGTH; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  private async hashOtp(otp: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(this.OTP_SALT_ROUNDS);
    const hash = await bcrypt.hash(otp, salt);
    return { hash, salt };
  }

  private async verifyOtpHash(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  async generateAndSendOtp(userId: string, email: string, firstName: string): Promise<OtpGenerationResult> {
    try {
      // Check if user has existing OTP
      const existingOtp = await otpRepository.findByUserId(userId);

      if (existingOtp) {
        // Check resend limits
        const now = new Date();

        if (existingOtp.canResendAfter > now) {
          return {
            success: false,
            message: `Please wait before requesting another OTP`,
            canResendAfter: existingOtp.canResendAfter,
          };
        }

        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (existingOtp.resendWindowStart > hourAgo && existingOtp.resendCount >= this.MAX_RESENDS_PER_HOUR) {
          return {
            success: false,
            message: "Maximum resend limit reached. Please try again later.",
            canResendAfter: new Date(existingOtp.resendWindowStart.getTime() + 60 * 60 * 1000),
          };
        }

        await otpRepository.deleteByUserId(userId);
      }

      // Generate new OTP
      const otpCode = this.generateOtpCode();
      const { hash, salt } = await this.hashOtp(otpCode);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + env.OTP_EXPIRES_IN * 1000);
      const canResendAfter = new Date(now.getTime() + this.RESEND_COOLDOWN_MINUTES * 60 * 1000);

      const shouldResetResendWindow =
        !existingOtp || now.getTime() - existingOtp.resendWindowStart.getTime() > 60 * 60 * 1000;

      const resendCount = shouldResetResendWindow ? 1 : (existingOtp?.resendCount || 0) + 1;
      const resendWindowStart = shouldResetResendWindow ? now : existingOtp?.resendWindowStart || now;

      await otpRepository.create({
        userId,
        otpHash: hash,
        salt,
        expiresAt,
        attemptCount: 0,
        maxAttempts: this.MAX_ATTEMPTS,
        resendCount,
        resendWindowStart,
        canResendAfter,
        createdAt: now,
        updatedAt: now,
      });

      // Send OTP email
      const emailSent = await emailService.sendOTPEmail(email, firstName, otpCode);

      if (!emailSent) {
        await otpRepository.deleteByUserId(userId);
        return {
          success: false,
          message: "Failed to send OTP email. Please try again.",
        };
      }

      logger.info(`OTP generated and sent for user: ${userId}`);

      return {
        success: true,
        message: "OTP sent successfully to your email",
      };
    } catch (error) {
      logger.error("Error generating OTP:", error);
      return {
        success: false,
        message: "Internal server error. Please try again.",
      };
    }
  }

  async verifyOtp(userId: string, otpCode: string): Promise<OtpVerificationResult> {
    try {
      const otpToken = await otpRepository.findByUserId(userId);

      if (!otpToken) {
        return {
          success: false,
          message: "OTP not found or expired. Please request a new one.",
        };
      }

      if (otpToken.expiresAt < new Date()) {
        await otpRepository.deleteByUserId(userId);
        return {
          success: false,
          message: "OTP has expired. Please request a new one.",
        };
      }

      if (otpToken.attemptCount >= otpToken.maxAttempts) {
        await otpRepository.deleteByUserId(userId);
        return {
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new OTP.",
        };
      }

      const isValid = await this.verifyOtpHash(otpCode, otpToken.otpHash);

      if (!isValid) {
        const newAttemptCount = otpToken.attemptCount + 1;
        await otpRepository.updateAttemptCount(userId, newAttemptCount);

        const attemptsRemaining = otpToken.maxAttempts - newAttemptCount;

        if (attemptsRemaining <= 0) {
          await otpRepository.deleteByUserId(userId);
          return {
            success: false,
            message: "Invalid OTP. Maximum attempts exceeded. Please request a new OTP.",
          };
        }

        return {
          success: false,
          message: `Invalid OTP. ${attemptsRemaining} attempts remaining.`,
          attemptsRemaining,
        };
      }

      await otpRepository.deleteByUserId(userId);

      logger.info(`OTP verified successfully for user: ${userId}`);

      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      return {
        success: false,
        message: "Internal server error. Please try again.",
      };
    }
  }

  async cleanupExpiredOtps(): Promise<number> {
    try {
      const deletedCount = await otpRepository.deleteExpired();
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired OTPs`);
      }
      return deletedCount;
    } catch (error) {
      logger.error("Error cleaning up expired OTPs:", error);
      return 0;
    }
  }

  async deleteUserOtp(userId: string): Promise<void> {
    await otpRepository.deleteByUserId(userId);
  }

  async canRequestOtp(userId: string): Promise<{ canRequest: boolean; waitTime?: number }> {
    const existingOtp = await otpRepository.findByUserId(userId);

    if (!existingOtp) {
      return { canRequest: true };
    }

    const now = new Date();

    if (existingOtp.canResendAfter > now) {
      const waitTime = Math.ceil((existingOtp.canResendAfter.getTime() - now.getTime()) / 1000);
      return { canRequest: false, waitTime };
    }

    // Check hourly limit
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (existingOtp.resendWindowStart > hourAgo && existingOtp.resendCount >= this.MAX_RESENDS_PER_HOUR) {
      const resetTime = new Date(existingOtp.resendWindowStart.getTime() + 60 * 60 * 1000);
      const waitTime = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      return { canRequest: false, waitTime };
    }

    return { canRequest: true };
  }

  async sendOtpByEmail(email: string): Promise<OtpGenerationResult> {
    try {
      // Delete any existing OTP for this email
      await Otp.deleteMany({ email: email.toLowerCase() });

      // Generate new OTP
      const otpCode = this.generateOtpCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

      await Otp.create({
        email: email.toLowerCase(),
        code: otpCode,
        expiresAt,
      });

      // Extract first name from email (use part before @)
      const firstName = email.split("@")[0] || "User";

      // Send OTP email via SMTP
      const emailSent = await emailService.sendOTPEmail(email, firstName, otpCode);

      if (!emailSent) {
        // Rollback: delete OTP if email sending failed
        await Otp.deleteMany({ email: email.toLowerCase() });
        throw new Error("Failed to send OTP email. Please check your email configuration.");
      }

      logger.info(`OTP sent successfully to: ${email}`);

      return {
        success: true,
        message: "OTP sent successfully",
      };
    } catch (error) {
      logger.error("Error sending OTP by email:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
      };
    }
  }

  async verifyOtpByEmail(email: string, otpCode: string): Promise<OtpVerificationResult> {
    try {
      const otpRecord = await Otp.findOne({ email: email.toLowerCase(), code: otpCode });

      if (!otpRecord) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          message: "OTP has expired. Please request a new one.",
        };
      }

      // Delete OTP after successful verification
      await Otp.deleteOne({ _id: otpRecord._id });

      logger.info(`OTP verified successfully for email: ${email}`);

      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error) {
      logger.error("Error verifying OTP by email:", error);
      return {
        success: false,
        message: "Internal server error. Please try again.",
      };
    }
  }
}

export default new OtpService();
