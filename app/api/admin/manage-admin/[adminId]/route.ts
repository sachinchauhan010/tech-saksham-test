import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import { ROLE } from "@/lib/enum";
import { EventModel } from "@/lib/models/Event";

interface UpdateAdminRequest {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  managedEvents?: string[];
}

// GET - Get single admin by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    await connectDB();
    const { adminId } = await params;
    console.log("Admin ID", adminId)

    const admin = await User.findOne({ 
      _id: adminId,
      role: { $in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] }
    }).select('-password').populate('managedEvents', 'eventCode title');

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: "Admin user not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: admin,
      message: "Admin user fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin user" },
      { status: 500 }
    );
  }
}

// PUT - Update admin by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    await connectDB();
    const { adminId } = await params;
    const body: UpdateAdminRequest = await request.json();

    // Validate role if provided
    if (body.role && body.role !== ROLE.ADMIN && body.role !== ROLE.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin or super_admin" },
        { status: 400 }
      );
    }

    // Check if email conflicts with another admin
    if (body.email) {
      const existingAdmin = await User.findOne({ 
        email: body.email,
        _id: { $ne: adminId }
      });
      if (existingAdmin) {
        return NextResponse.json(
          { error: "Email already exists for another admin" },
          { status: 409 }
        );
      }
    }

    // Fetch event details for managedEvents
    let processedManagedEvents: Array<{eventCode: string, title: string}> = [];
    if (body.managedEvents && Array.isArray(body.managedEvents) && body.managedEvents.length > 0) {
      // Fetch events to get their titles
      const events = await EventModel.find({ 
        eventCode: { $in: body.managedEvents } 
      });
      
      processedManagedEvents = body.managedEvents.map((eventCode: string) => {
        const event = events.find((e: any) => e.eventCode === eventCode);
        return {
          eventCode,
          title: event?.title || eventCode // Fallback to eventCode if title not found
        };
      });
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { 
        ...body,
        managedEvents: processedManagedEvents 
      },
      { 
        new: true, 
        runValidators: true,
        returnDocument: 'after'
      }
    ).select('-password').populate('managedEvents', 'eventCode title');

    if (!updatedAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: "Admin user updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Failed to update admin user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    await connectDB();
    const { adminId } = await params;

    // Check if admin exists
    const admin = await User.findOne({ 
      _id: adminId,
      role: { $in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] }
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: "Admin user not found",
      }, { status: 404 });
    }

    // Don't allow deletion of super admins (optional business rule)
    if (admin.role.includes(ROLE.SUPER_ADMIN)) {
      return NextResponse.json({
        success: false,
        message: "Cannot delete super admin users",
      }, { status: 403 });
    }

    await User.findByIdAndDelete(adminId);

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Failed to delete admin user" },
      { status: 500 }
    );
  }
}