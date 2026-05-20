import { User } from '@/lib/models';
import { generateToken, setAuthToken } from '@/lib/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone: mobile });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const tokens = generateToken({
      email: user.email,
      role: user.role,
    });

    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate token' },
        { status: 500 }
      );
    }

    await setAuthToken(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Token generated successfully',
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Save token error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}