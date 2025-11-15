// OtpTokenDomain model
export interface OtpToken {
  id?: string;
  userId?: string;
  otpHash: string;
  salt: string;
  expiresAt: Date;
  attemptCount: number;
  maxAttempts: number;
  resendCount: number;
  resendWindowStart: Date;
  canResendAfter: Date;
  createdAt: Date;
  updatedAt: Date;
}
