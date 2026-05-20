import { NextRequest, NextResponse } from 'next/server';
import { QRToken } from '@/lib/models/QRToken';
import { User } from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import { generateToken, setAuthToken } from '@/lib/token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and validate token
    const qrToken = await QRToken.findOne({
      token
    });

    if (!qrToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findOne({ userId: qrToken.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateToken({
      email: user.email,
      role: [user.role] // Convert string to array for token system
    });

    // Set auth cookies
    await setAuthToken(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      },
      redirect: '/questions'  
    });

  } catch (error) {
    console.error('Error during QR login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
