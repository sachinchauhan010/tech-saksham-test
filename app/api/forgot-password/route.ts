import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { passwordResetStore } from '@/lib/otp-store';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email service (will use Nodemailer when installed)
async function sendPasswordResetEmail(email: string, otp: string): Promise<boolean> {
  try {
    // Try to use the email service
    const { sendEmail, generateOTPEmail } = await import('@/lib/email').catch(() => ({
      sendEmail: async () => ({ success: false, error: 'Email service not available' }),
      generateOTPEmail: () => ({ subject: '', html: '', text: '' })
    }));

    const { subject, html, text } = generateOTPEmail(email, otp, 'password_reset');
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text
    });

    if (result.success) {
      console.log(`Password reset OTP sent to ${email}: ${otp}`);
      // In development, return OTP for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Development Password Reset OTP: ${otp}`);
      }
      return true;
    } else {
      console.error('Password reset email sending failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Password reset email service error:', error);
    // Fallback: log OTP for development
    console.log(`Development Password Reset OTP: ${otp}`);
    return true; // Allow development to continue
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // If in fallback mode, simulate password reset
    if (isUsingFallbackMode()) {
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      passwordResetStore.set(email, {
        otp,
        expiresAt,
        attempts: 0,
      });

      const emailSent = await sendPasswordResetEmail(email, otp);

      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send password reset email' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset code sent to your email (offline mode)',
        fallback: true,
        // In development, return the OTP
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists or not for security
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      passwordResetStore.set(email, {
        otp,
        expiresAt,
        attempts: 0,
      });

      const emailSent = await sendPasswordResetEmail(email, otp);

      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send password reset email' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset code',
        // In development, return the OTP
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    }

    // Generate OTP and store it
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      userId: user.userId,
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    // Clean up expired OTPs periodically
    for (const [key, value] of passwordResetStore.entries()) {
      if (Date.now() > value.expiresAt) {
        passwordResetStore.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email',
      // In development, return the OTP
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
