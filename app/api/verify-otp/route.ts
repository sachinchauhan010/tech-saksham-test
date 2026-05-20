import { NextRequest, NextResponse } from 'next/server';
import { getOtp, incrementOtpAttempts, deleteOtp } from '@/lib/otp-service';
import { validateFields, validateOTP, validateEmail } from '@/lib/validations';
import { OTP_TYPE, ROLE } from '@/lib/enum';
import { generateToken, setAuthToken } from '@/lib/token';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

const otpMaxAttempts = process.env.OTP_MAX_ATTEMPTS;
const otpExpiryMinutes = process.env.OTP_EXPIRY_MINUTES;
const otpExpiryMs = parseInt(otpExpiryMinutes!) * 60 * 1000;
const otpMaxAttemptsNum = parseInt(otpMaxAttempts!);

export async function POST(req: NextRequest) {
  try {
    const { email, otp, OtpType, isForLogin, preExistingUser } = await req.json();
    console.log( email, otp, OtpType )

    const validationError = validateFields({ email, otp, OtpType }, ['email', 'otp', 'OtpType']);
    if (!validationError.success) {
      return NextResponse.json(
        { error: validationError.error?.message },
        { status: 400 }
      );
    }

    const isValidEmail = validateEmail(email);
    if (isValidEmail !== true) {
      return isValidEmail;
    }

    const isValidOTP = validateOTP(otp);
    if (isValidOTP !== true) {
      return isValidOTP;
    }

    const storedData = await getOtp(email.toLowerCase(), OtpType);

    if (!storedData) {
      console.log(`No OTP found for ${OtpType === OTP_TYPE.EMAIL_VERIFICATION ? 'email' : 'phone number'} :`, email);
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const isExpired = Date.now() > storedData.expiresAt.getTime() + otpExpiryMs;

    if (isExpired) {
      console.log(
        `OTP expired for ${
          OtpType === OTP_TYPE.EMAIL_VERIFICATION ? "email" : "phone number"
        }:`,
        email
      );
      await deleteOtp(email.toLowerCase(), OtpType);

      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one' },
        { status: 400 }
      );
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= otpMaxAttemptsNum) {
      console.log(`Too many attempts for ${OtpType === OTP_TYPE.EMAIL_VERIFICATION ? 'email' : 'phone number'} :`, email);
      // await deleteOtp(email.toLowerCase(), OtpType);
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code' },
        { status: 400 }
      );
    }

    // Increment attempts
    await incrementOtpAttempts(email.toLowerCase(), OtpType);

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('Invalid OTP for email:', email, 'attempt:', storedData.attempts + 1);
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // OTP is valid, remove it from db
    await deleteOtp(email.toLowerCase(), OtpType);

    if(preExistingUser){
      const tokens = generateToken({
      email: email,
      role: [ROLE.USER],
    });

    if (!tokens) {
      return NextResponse.json(
        { error: "Failed to generate tokens" },
        { status: 500 },
      );
    }

    await setAuthToken(tokens.accessToken, tokens.refreshToken);

    }

    // If for login, set auth tokens
    if (isForLogin) {
      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const tokens = generateToken({
        email: user.email,
        role: user.role,
      });

      if (!tokens) {
        return NextResponse.json(
          { error: 'Failed to generate tokens' },
          { status: 500 }
        );
      }

      await setAuthToken(tokens.accessToken, tokens.refreshToken);
      
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      message: `${OtpType === OTP_TYPE.EMAIL_VERIFICATION ? 'Email' : 'Phone number'} verified successfully`,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}