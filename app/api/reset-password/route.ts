import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { passwordResetStore } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // If in fallback mode, simulate password reset
    if (isUsingFallbackMode()) {
      const storedData = passwordResetStore.get(email);

      if (!storedData) {
        return NextResponse.json(
          { error: 'No password reset request found for this email' },
          { status: 400 }
        );
      }

      // Check if OTP has expired
      if (Date.now() > storedData.expiresAt) {
        passwordResetStore.delete(email);
        return NextResponse.json(
          { error: 'Password reset code has expired' },
          { status: 400 }
        );
      }

      // Check attempts (max 3 attempts)
      if (storedData.attempts >= 3) {
        passwordResetStore.delete(email);
        return NextResponse.json(
          { error: 'Too many attempts. Please request a new password reset' },
          { status: 400 }
        );
      }

      // Increment attempts
      storedData.attempts++;

      // Verify OTP
      if (storedData.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid password reset code' },
          { status: 400 }
        );
      }

      // OTP is valid, remove it from store
      passwordResetStore.delete(email);

      return NextResponse.json({
        success: true,
        message: 'Password reset successful (offline mode)',
        fallback: true
      });
    }

    const storedData = passwordResetStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No password reset request found for this email' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      passwordResetStore.delete(email);
      return NextResponse.json(
        { error: 'Password reset code has expired' },
        { status: 400 }
      );
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= 3) {
      passwordResetStore.delete(email);
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new password reset' },
        { status: 400 }
      );
    }

    // Increment attempts
    storedData.attempts++;

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid password reset code' },
        { status: 400 }
      );
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

    // Update user password
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    // Remove OTP from store
    passwordResetStore.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
