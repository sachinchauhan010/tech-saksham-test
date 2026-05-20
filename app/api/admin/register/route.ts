import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { EventModel } from '@/lib/models/Event';
import { ROLE } from '@/lib/enum';

interface AdminRegisterRequest {
  name: string;
  email: string;
  phone: string;
  department: string;
  password?: string; // Made optional - password no longer required
  emailVerified?: boolean;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateUserId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `GOV-${year}-${randomNum}`;
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: AdminRegisterRequest = await req.json();
    const { name, email, phone, department, password, emailVerified } = body;
    const { id: eventId } = await params;

    // Validation - password no longer required
    if (!name || !email || !phone || !department) {
      return NextResponse.json(
        { error: 'Name, email, phone, and department are required' },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'MongoDB connection not configured',
          message: 'Please add DATABASE_URL to your environment variables in the Settings panel'
        },
        { status: 500 }
      );
    }

    await connectDB();

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (user) {
      // Ensure we don't mix up different users with the same phone but different email or vice-versa
      if (user.email !== email || user.phone !== phone) {
        return NextResponse.json(
          { error: 'Email or phone is already associated with another account.' },
          { status: 409 }
        );
      }

      const alreadyApplied = user.eventApplied?.some((e: any) => e.eventCode === event.eventCode || e.eventId?.toString() === event._id.toString());
      if (alreadyApplied) {
        return NextResponse.json(
          { error: 'User already registered for this event' },
          { status: 409 }
        );
      } else {
        user.eventApplied.push({ eventCode: event.eventCode, eventId: event._id });
        await user.save();
      }
    } else {
      const userId = generateUserId();
      const defaultPassword = 'default-password-' + Date.now();
      const hashedPassword = hashPassword(password || defaultPassword);
      
      user = new User({
        userId,
        name,
        email,
        phone,
        department,
        password: hashedPassword,
        role: ROLE.USER,
        eventApplied: [{ eventCode: event.eventCode, eventId: event._id }],
      });
      
      await user.save();
    }

    // ADMIN REGISTRATION - NO automatic login, just registration
    return NextResponse.json({
      success: true,
      userId: user.userId,
      name: user.name,
      email: user.email,
      message: 'Participant registered successfully',
    });
  } catch (error) {
    console.error('Admin registration error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
