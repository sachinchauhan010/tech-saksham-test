// Shared OTP stores for the application

// Email verification OTP store
export const otpStore = new Map<string, { 
  otp: string; 
  expiresAt: number; 
  attempts: number; 
}>();

// Password reset OTP store
export const passwordResetStore = new Map<string, { 
  otp: string; 
  expiresAt: number; 
  attempts: number; 
  userId?: string;
}>();
