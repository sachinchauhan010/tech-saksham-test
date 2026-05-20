import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { ROLE } from '@/lib/enum';

// CREATE User
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, email, phone, department, role, password } = body;

    if (!name || !email || !phone || !department || !role || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    // Generate random userId
    const userId = `USR-${Math.floor(10000 + Math.random() * 90000)}`;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User with this email or phone already exists' }, { status: 400 });
    }

    const newUser = await User.create({
      userId,
      name,
      email,
      phone,
      department,
      role,
      password, // Note: In production this should be hashed. Assuming existing implementation handles it or it's plain text for now.
    });

    return NextResponse.json({ success: true, data: newUser, message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating user' }, { status: 500 });
  }
}

// UPDATE User
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, name, email, phone, department, role, password } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = { name, email, phone, department, role };
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser, message: 'User updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error updating user' }, { status: 500 });
  }
}

// DELETE User
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(_id);
    
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error deleting user' }, { status: 500 });
  }
}
