import { NextRequest, NextResponse } from "next/server";
import { storeOtp, CheckOTPType } from "@/lib/otp-service";
import { validateFields } from "@/lib/validations";
import { connectDB } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { User } from "@/lib/models";
import { generateOTPEmail, sendEmail } from "@/lib/email";
import { OTP_TYPE } from "@/lib/enum";

const otpExpiryMinutes = process.env.OTP_EXPIRY_MINUTES;
const otpExpiryMs = parseInt(otpExpiryMinutes!) * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support either key for backward compatibility
    const userPhoneOrEmail = body.userPhoneOrEmail || body.email;
    const { otpType, isForLogin, isAlreadyExist } = body;

    if (!userPhoneOrEmail) {
      return NextResponse.json(
        { error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    if (!otpType) {
      return NextResponse.json(
        { error: "otpType is required" },
        { status: 400 }
      );
    }

    const calculatedOtpType = await CheckOTPType(userPhoneOrEmail);
    if (!calculatedOtpType) {
      return NextResponse.json(
        { error: "Invalid email or phone number format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if account already exists
    if (!isForLogin && !isAlreadyExist) {
      const existingUser = await User.findOne({
        $or: [{ email: userPhoneOrEmail.toLowerCase() }, { phone: userPhoneOrEmail }],
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Account already registered. Please login or use a different account." },
          { status: 409 }
        );
      }
    }

    //Generate OTP
    const generatedOTP = generateOTP();
    if (!generatedOTP) {
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 },
      );
    }

    const otpData = {
      email: userPhoneOrEmail, // Used generically as the recipient identifier in the DB
      otp: generatedOTP,
      type: otpType,
      expiresAt: new Date(Date.now() + otpExpiryMs),
      attempts: 0,
    };

    const storedData = await storeOtp(otpData);
    if (!storedData) {
      return NextResponse.json(
        { error: "Failed to save OTP" },
        { status: 500 },
      );
    }

    // if (calculatedOtpType === OTP_TYPE.EMAIL_VERIFICATION) {
    //   // Determine the email purpose based on OTP type
    //   const purpose = otpType === OTP_TYPE.PASSWORD_RESET ? 'password_reset' : 'verification';

    //   // Generate email content
    //   const { subject, html, text } = generateOTPEmail(userPhoneOrEmail, generatedOTP, purpose);

    //   // Send the email
    //   const emailResult = await sendEmail({
    //     to: userPhoneOrEmail,
    //     subject,
    //     html,
    //     text,
    //   });

    //   console.log("Email sent successfully", emailResult);

    //   if (!emailResult.success) {
    //     return NextResponse.json(
    //       { error: "Failed to send OTP email" },
    //       { status: 500 },
    //     );
    //   }
    // } else if (calculatedOtpType === OTP_TYPE.PHONE_NUMBER_VERIFICATION) {
    //   console.log(`[SMS Simulation] OTP for ${userPhoneOrEmail} is: ${generatedOTP}`);
    // }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        email: userPhoneOrEmail,
      },
      otp: generatedOTP, // Sending in response for dev purposes? Kept it as it was in original code
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 },
    );
  }
}
