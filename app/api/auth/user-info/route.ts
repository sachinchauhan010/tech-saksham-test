import { getUserInfo, isUserAuthenticated } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const isAuthenticated = await isUserAuthenticated();
    // console.log('User info API - isUserAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      // console.log('User not authenticated, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userInfo = await getUserInfo();
    // console.log('User info from cookie:', userInfo);

    if (!userInfo) {
      // console.log('User info not found, returning 404');
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 404 }
      );
    }

    // console.log('Returning user info:', userInfo);
    return NextResponse.json({
      success: true,
      user: userInfo
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
