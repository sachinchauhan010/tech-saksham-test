import { User } from "@/lib/models";
import { EventModel } from "@/lib/models/Event";
import { getServerUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const currentLoggedInUser = await getServerUser(request);

    if (!currentLoggedInUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email, eventCodes } = await request.json();

    if (!email || !eventCodes || !Array.isArray(eventCodes)) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the events to apply for
    const events = await EventModel.find({ eventCode: { $in: eventCodes } });

    if (events.length === 0) {
      return NextResponse.json(
        { message: "No valid events found" },
        { status: 404 },
      );
    }

    // Add events to user's eventApplied array if not already present
    const newEventCodes = eventCodes.filter(
      (code) =>
        !user.eventApplied.some((applied: any) => applied.eventCode === code),
    );

    if (newEventCodes.length === 0) {
      return NextResponse.json(
        { message: "User already applied for these events" },
        { status: 400 },
      );
    }

    // Add the new events to the user's eventApplied array
    const eventsToAdd = events.filter((event) =>
      newEventCodes.includes(event.eventCode),
    );
    user.eventApplied.push(...eventsToAdd);

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Successfully applied for ${newEventCodes.length} event(s)`,
        appliedEvents: newEventCodes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error applying for events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
