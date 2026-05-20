import { connectDB, isUsingFallbackMode } from "@/lib/db";
import { OTPModel } from "@/lib/models/OTPModel";
import { OTP_STATUS, OTP_TYPE } from "./enum";
import { validateFields } from "./validations";
import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "./auth";
import { sendEmail, generateOTPEmail } from "./email";

export interface OtpData {
  email: string;
  otp: string;
  type: OTP_TYPE;
  expiresAt: Date;
  attempts: number;
  userId?: string;
  status?: OTP_STATUS;
}

export async function sendOtp({
  email,
  otpType,
}: {
  email: string;
  otpType: OTP_TYPE;
}) {
  try {
    const validationResult = validateFields({ email, otpType }, [
      "email",
      "otpType",
    ]);
    if (!validationResult.success) {
      return validationResult;
    }

    await connectDB();

    //Generate OTP
    const generatedOTP = generateOTP();
    if (!generatedOTP) {
      throw new Error("Failed to generate OTP");
    }

    const otpData = {
      email: email,
      otp: generatedOTP,
      type: otpType,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
    };

    const storedData = await storeOtp(otpData);
    if (!storedData) {
      throw new Error("Failed to save OTP");
    }

    // Determine the email purpose based on OTP type
    // const purpose = otpType === OTP_TYPE.PASSWORD_RESET ? 'password_reset' : 'verification';

    // // Generate email content
    // const { subject, html, text } = generateOTPEmail(email, generatedOTP, purpose);

    // // Send the email
    // const emailResult = await sendEmail({
    //   to: email,
    //   subject,
    //   html,
    //   text,
    // });

    // console.log("Email sent successfully", emailResult);

    // if (!emailResult.success) {
    //   throw new Error("Failed to send OTP email: " + emailResult.error);
    // }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Send OTP error:", error);
    return { success: false, error: "An unexpected error occurred while sending OTP" };
  }
}

export async function storeOtp(data: OtpData): Promise<boolean> {
  try {
    if (!data) {
      throw new Error("OTP data is required");
    }

    await connectDB();

    // Delete any existing OTP for this email and type
    await OTPModel.deleteMany({ email: data.email, type: data.type });

    // Create new OTP record
    await OTPModel.create({
      email: data.email,
      otp: data.otp,
      type: data.type,
      expiresAt: data.expiresAt,
      attempts: 0,
      userId: data.userId,
    });

    return true;
  } catch (error) {
    console.error("Store OTP error:", error);
    return false;
  }
}

export async function getOtp(
  email: string,
  type: OTP_TYPE,
): Promise<OtpData | null> {
  try {
    const validationError = validateFields({ email, type }, ["email", "type"]);

    if (!validationError.success) {
      return null;
    }

    await connectDB();

    const otpRecord = await OTPModel.findOne({
      email: email.toLowerCase(),
      type,
    });

    if (!otpRecord) return null;

    return {
      email: otpRecord.email,
      otp: otpRecord.otp,
      type: otpRecord.type,
      expiresAt: otpRecord.expiresAt,
      attempts: otpRecord.attempts,
      userId: otpRecord.userId,
    };
  } catch (error) {
    console.error("Get OTP error:", error);
    return null;
  }
}

export async function incrementOtpAttempts(
  email: string,
  type: OTP_TYPE,
): Promise<boolean> {
  try {
    const ValidateField = validateFields({ email, type }, ["email", "type"]);

    if (!ValidateField.success) {
      throw new Error(ValidateField.error?.message || "Validation failed");
    }

    await connectDB();

    const result = await OTPModel.findOneAndUpdate(
      { email: email.toLowerCase(), type },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" },
    );

    if (!result) return false;

    // Delete if too many attempts
    if (result.attempts >= 3) {
      await OTPModel.deleteOne({ email: email.toLowerCase(), type });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Increment OTP attempts error:", error);
    return false;
  }
}

export async function deleteOtp(
  email: string,
  type: OTP_TYPE,
): Promise<boolean> {
  try {
    const ValidateField = validateFields({ email, type }, ["email", "type"]);

    if (!ValidateField.success) {
      throw new Error(ValidateField.error?.message || "Validation failed");
    }

    await connectDB();

    await OTPModel.deleteOne({ email: email.toLowerCase(), type });
    return true;
  } catch (error) {
    console.error("Delete OTP error:", error);
    return false;
  }
}

export async function cleanupExpiredOtps(): Promise<number> {
  try {
    await connectDB();

    const result = await OTPModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup expired OTPs error:", error);
    return 0;
  }
}

//Check the string is phoneNumber or email
export async function CheckOTPType(userPhoneOrEmail: string) {
  try {
    const isPhoneNumber = /^\d{10}$/.test(userPhoneOrEmail);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userPhoneOrEmail);

    if (isPhoneNumber) {
      return OTP_TYPE.PHONE_NUMBER_VERIFICATION;
    } else if (isEmail) {
      return OTP_TYPE.EMAIL_VERIFICATION;
    }

    return null;
  } catch (error) {
    console.error("Check OTP type error:", error);
    return null;
  }
}

export async function updateOtpStatus(
  email: string,
  type: OTP_TYPE,
  status: OTP_STATUS
): Promise<boolean> {
  try {
    await connectDB();

    const result = await OTPModel.findOneAndUpdate(
      { email: email.toLowerCase(), type },
      { $set: { status } },
      { new: true }
    );

    if (!result) {
      console.log(`No OTP record found to update for email: ${email}, type: ${type}`);
      return false;
    }

    console.log(`OTP status updated to "${status}" for email: ${email}, type: ${type}`);
    return true;
  } catch (error) {
    console.error('updateOtpStatus error:', error);
    return false;
  }
}
