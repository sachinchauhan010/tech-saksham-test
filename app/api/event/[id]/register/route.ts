import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import {
  validateFields,
  validateName,
  validateEmail,
  validateIndianPhoneNumber,
} from "@/lib/validations";
import { generateUserId } from "@/lib/auth";
import { ROLE } from "@/lib/enum";
import { generateToken, setAuthToken } from "@/lib/token";


interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  department: string;
}

import { EventModel } from "@/lib/models/Event";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: RegisterRequest = await req.json();
    const { name, email, phone, department } = body;
    const { id: eventId } = await params;

    //Validate Missing fields
    const validationError = validateFields(body, [
      "name",
      "email",
      "phone",
      "department",
    ]);
    if (!validationError.success) {
      return NextResponse.json(
        { error: validationError.error?.message },
        { status: 400 },
      );
    }

    const nameValidation = validateName(name);
    if (nameValidation !== true) {
      return nameValidation;
    }

    const emailValidation = validateEmail(email);
    if (emailValidation !== true) {
      return emailValidation;
    }

    const phoneValidation = validateIndianPhoneNumber(phone);
    if (phoneValidation !== true) {
      return phoneValidation;
    }

    await connectDB();

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }
    
    const eventCode = event.eventCode;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });

    if (user) {
      // Ensure we don't mix up different users with the same phone but different email or vice-versa
      if (user.email !== email || user.phone !== phone) {
        return NextResponse.json(
          { error: "Email or phone is already associated with another account." },
          { status: 409 },
        );
      }

      // Check if already applied
      const alreadyApplied = user.eventApplied?.some((e: any) => e.eventCode === eventCode);
      if (alreadyApplied) {
        return NextResponse.json(
          { error: "User already registered for this event" },
          { status: 409 },
        );
      } else {
        user.eventApplied.push({ eventCode, eventId: event._id });
        await user.save();
      }
    } else {
      const userId = generateUserId();

      user = new User({
        userId,
        name,
        email,
        phone,
        department,
        role: ROLE.USER,
        eventApplied: [{ eventCode, eventId: event._id }],
      });

      await user.save();
    }

    const tokens = generateToken({
      email: user.email,
      role: user.role,
    });

    if (!tokens) {
      return NextResponse.json(
        { error: "Failed to generate tokens" },
        { status: 500 },
      );
    }

    await setAuthToken(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 },
    );
  }
}

