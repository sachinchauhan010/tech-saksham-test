import { User } from "@/lib/models";
import { EventModel } from "@/lib/models/Event";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

		const user= await getServerUser(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await User.findOne({ _id: user._id });

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const eventApplied = userDoc.eventApplied;

    const eventCodes = eventApplied.map((event: any) => event.eventCode);

    if (!eventCodes || eventCodes.length === 0) {
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
        message: "Applied events fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching applied events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
