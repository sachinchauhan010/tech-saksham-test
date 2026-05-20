import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { ROLE } from '@/lib/enum';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId, newRole } = await req.json();

    // Validate input
    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, message: 'User ID and new role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(ROLE).includes(newRole)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole} successfully`,
      user: {
        _id: updatedUser._id,
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
