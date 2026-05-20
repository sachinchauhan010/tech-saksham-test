import { clearUserSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear user session (since admin is also a user with role='admin')
    await clearUserSession();

    return NextResponse.json(
      { success: true, message: 'Admin logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
