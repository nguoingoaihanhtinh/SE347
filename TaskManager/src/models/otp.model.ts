import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, code: 1 });

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);

