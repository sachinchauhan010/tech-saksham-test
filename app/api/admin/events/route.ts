import { EventModel } from "@/lib/models/Event";
import { connectDB } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerUser } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentLoggedInUser = await getServerUser(req);

    if (!currentLoggedInUser) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Fetch all events
    const events = await EventModel.find({})
      .select('title eventCode startDate endDate category status')
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: events,
      message: `Found ${events.length} events`
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}
