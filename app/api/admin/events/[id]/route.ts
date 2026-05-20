import { EventModel } from "@/lib/models/Event";
import { connectDB } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerUser } from "@/lib/server-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const currentLoggedInUser = await getServerUser(request);

    if (!currentLoggedInUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Find the event
    const event = await EventModel.findById(id);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Check if the admin has permission to update this event
    // This would depend on your authorization logic - for now, we'll allow any authenticated admin
    // You might want to check if the event is in the admin's managedEvents

    // Update only the allowed fields
    const allowedFields = ['isIdCardIssue', 'isCertificateIssue'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No valid fields to update" 
      }, { status: 400 });
    }

    // Update the event
    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully"
    });

  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
