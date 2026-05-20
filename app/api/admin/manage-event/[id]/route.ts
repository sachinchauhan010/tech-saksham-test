import { connectDB } from "@/lib/db";
import { EventModel } from "@/lib/models/Event";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Event ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await EventModel.findById(id).populate('organizer', 'userId name email phone department role');

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Event ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await EventModel.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete event",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Event ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await EventModel.findByIdAndUpdate(id, data, { new: true });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event",
      },
      { status: 500 }
    );
  }
}
