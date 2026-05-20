import { NextRequest, NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Clear user session and info cookies
    await clearUserSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
