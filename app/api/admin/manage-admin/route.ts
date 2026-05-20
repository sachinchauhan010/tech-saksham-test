import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { EventModel } from "@/lib/models/Event";
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

interface AdminRequest {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  managedEvents?: string[]; // Array of event IDs this admin manages
}

export async function GET() {
  try {
    await connectDB();

    // Fetch all admin users (exclude regular users)
    const admins = await User.find({
      role: { $in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
    })
      .select("-password")
      .populate("managedEvents", "eventCode title");

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No admin users found",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      data: admins,
      message: "Admin users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body: AdminRequest = await req.json();
    const { name, email, phone, department, role, managedEvents } = body;
		console.log(managedEvents, "Managed Events")

    //Validate required fields
    const validationError = validateFields(body, [
      "name",
      "email",
      "phone",
      "department",
      "role",
      "managedEvents",
    ]);
    if (!validationError.success) {
      return NextResponse.json(
        { error: validationError.error?.message },
        { status: 400 },
      );
    }

    // Validate individual fields
    if (!validateName(name)) {
      return NextResponse.json(
        { error: "Invalid name format" },
        { status: 400 },
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!validateIndianPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }
				

    // Normalize role - handle both string and array inputs
    let normalizedRole = role;
    if (Array.isArray(role)) {
      normalizedRole = role[0]; // Take first element if it's an array
    }

    // Validate role (must be admin or super_admin)
    if (normalizedRole !== ROLE.ADMIN && normalizedRole !== ROLE.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin or super_admin" },
        { status: 400 },
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 },
      );
    }

    // Fetch event details for managedEvents
    let processedManagedEvents: Array<{eventCode: string, title: string}> = [];
    if (managedEvents && Array.isArray(managedEvents) && managedEvents.length > 0) {
      // Fetch events to get their titles
      const events = await EventModel.find({ 
        eventCode: { $in: managedEvents } 
      });
      
      processedManagedEvents = managedEvents.map((eventCode: string) => {
        const event = events.find((e: any) => e.eventCode === eventCode);
        return {
          eventCode,
          title: event?.title || eventCode // Fallback to eventCode if title not found
        };
      });
    }

    // Create new admin user
    const admin = new User({
      userId: generateUserId(),
      name,
      email,
      phone,
      department,
      role: normalizedRole,
      managedEvents: processedManagedEvents,
    });

    const savedAdmin = await admin.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: savedAdmin.userId,
        name: savedAdmin.name,
        email: savedAdmin.email,
        phone: savedAdmin.phone,
        department: savedAdmin.department,
        role: savedAdmin.role,
        managedEvents: savedAdmin.managedEvents,
      },
      message: "Admin user created successfully",
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 },
    );
  }
}
