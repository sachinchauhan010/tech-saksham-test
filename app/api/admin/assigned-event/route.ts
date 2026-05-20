import { User } from "@/lib/models";
import { EventModel } from "@/lib/models/Event";
import { getServerUser } from "@/lib/server-auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const currentLoggedInUser = await getServerUser(request);

    if (!currentLoggedInUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await User.findOne({ _id: currentLoggedInUser._id });

    if (!adminUser) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    console.log("Admin user:", adminUser);

    const assignedEvents = adminUser.managedEvents;
    console.log("Assigned events:", assignedEvents);

    const eventCodes = assignedEvents.map((event: any) => event.eventCode);

    if(!eventCodes || eventCodes.length === 0) {
      return NextResponse.json(
        { success: true, events: [], message: "No Event Assigned" },
        { status: 200 },
      );
    }
    
    const events = await EventModel.find({ eventCode: { $in: eventCodes } });

    if (!events || events.length === 0) {
      return NextResponse.json(
        { success: true, events: [], message: "No Event Assigned" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        events,
        message: "Assigned events fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching assigned events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
