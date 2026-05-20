import mongoose from 'mongoose';
import { OTP_STATUS, OTP_TYPE } from '../enum';

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    default: OTP_TYPE.PHONE_NUMBER_VERIFICATION
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: OTP_STATUS.PENDING,
  },
});

OTPSchema.index({ email: 1 });

export const OTPModel = mongoose.models.OTP || mongoose.model('OTP', OTPSchema);