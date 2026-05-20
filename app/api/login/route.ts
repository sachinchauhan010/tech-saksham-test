import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/auth";
import { storeOtp, CheckOTPType } from "@/lib/otp-service";
import { OTP_TYPE } from "@/lib/enum";
import { generateOTPEmail, sendEmail } from "@/lib/email";

const SESSION_TOKEN_SECRET =
  process.env.SESSION_TOKEN_SECRET || "dev-secret-key";

interface LoginRequest {
  userPhoneOrEmail: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { userPhoneOrEmail } = body;

    if (!userPhoneOrEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Find user by userId or email
    const user = await User.findOne({
      $or: [
        { phone: userPhoneOrEmail },
        { email: userPhoneOrEmail.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    //Generate OTP
    const generatedOTP = generateOTP();
    if (!generatedOTP) {
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 },
      );
    }

    const otpType = await CheckOTPType(userPhoneOrEmail);

    if (!otpType) {
      return NextResponse.json(
        { error: "Invalid email or phone number format" },
        { status: 400 },
      );
    }

    const otpData = {
      email: user.email,
      otp: generatedOTP,
      type: otpType,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    };

    const storedData = await storeOtp(otpData);
    if (!storedData) {
      return NextResponse.json(
        { error: "Failed to save OTP" },
        { status: 500 },
      );
    }

    // if (otpType === OTP_TYPE.EMAIL_VERIFICATION) {
    //   // This is the login route, so the purpose is always verification
    //   const purpose = 'verification';

    //   // Generate email content
    //   const { subject, html, text } = generateOTPEmail(user.email, generatedOTP, purpose);

    //   // Send the email
    //   const emailResult = await sendEmail({
    //     to: user.email,
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
    // } else if (otpType === OTP_TYPE.PHONE_NUMBER_VERIFICATION) {
    //   // For phone number verification, we just log the OTP for now
    //   console.log(`[SMS Simulation] OTP for ${userPhoneOrEmail} is: ${generatedOTP}`);
    // }


    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        name: user.name,
        email: user.email,
        otpType: otpType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Login failed. Please try again later." },
      { status: 500 },
    );
  }
}
