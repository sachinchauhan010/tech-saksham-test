import { EventModel } from "@/lib/models/Event";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateFields } from "@/lib/validations";

export async function GET() {
  // Fetch all events from database
  try {
    await connectDB();
    const events = await EventModel.find({}).populate('organizer', 'userId name email phone department role');

    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No events is registered yet",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      data: events,
      message: "Events fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}


export async function POST(request: Request) {
  // Create a new event
  try {

    const {
      eventCode,
      title,
      slug,
      description,
      shortDescription,
      category,
      bannerImage,
      gallery,
      startDate,
      endDate,
      registrationOpenDate,
      registrationCloseDate,
      format,
      location,
      virtualLink,
      organizer,
      sessions,
      status,
      tags,
      isFeatured,
      isIdCardIssue,
      isCertificateIssue,
      certificateTemplate
    } = await request.json();

    const validation = validateFields({
      eventCode,
      title,
      slug,
      description,
      category,
      startDate,
      endDate,
      format,
      location,
      sessions
    }, ['eventCode', 'title', 'slug', 'description', 'category', 'startDate', 'endDate', 'format', 'location', 'sessions']);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error?.message || 'Validation failed'
      }, { status: 400 });
    }

    await connectDB();

    const event = new EventModel({
      eventCode,
      title,
      slug,
      description,
      shortDescription,
      category,
      bannerImage,
      gallery,
      startDate,
      endDate,
      registrationOpenDate,
      registrationCloseDate,
      format,
      location,
      virtualLink,
      organizer,
      sessions,
      status,
      tags,
      isFeatured,
      isIdCardIssue,
      isCertificateIssue,
      certificateTemplate
    });

    const savedEvent = await event.save();

    return NextResponse.json({
      success: true,
      data: savedEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
