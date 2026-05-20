import { getUserInfo } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get user info from session
    const userInfo = await getUserInfo();

    if (!userInfo) {
      return NextResponse.json({
        authenticated: false,
        role: null
      });
    }

    // Check if user has admin role
    const isAdmin = userInfo.role.includes('admin');

    return NextResponse.json({
      authenticated: true,
      role: userInfo.role,
      isAdmin: isAdmin
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
