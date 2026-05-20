import { connectDB } from "@/lib/db";
import { EventModel } from "@/lib/models/Event";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const event = await EventModel.findById(id);

    if (!event) {
      return Response.json(
        { success: false, message: "Event not found", data: null },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, message: "Event retrieved successfully", data: event },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
