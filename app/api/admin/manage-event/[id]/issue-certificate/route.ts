import { NextRequest, NextResponse } from "next/server";
import { EventModel } from "@/lib/models/Event";
import { connectDB } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

 try {
    
    await connectDB();
    console.log('Looking for event with ID:', id);
    const event = await EventModel.findOne({ _id: id });
    console.log('Found event:', event);
    
    if (!event) {
        console.log('No Event found with ID:', id);
        return NextResponse.json(
            {
                success: false,
                message: "Event not found",
            },
            { status: 200 }
        );
    }

    const updatedEvent= await EventModel.findByIdAndUpdate(id, {
        $set: {
            isCertificateIssue: !event.isCertificateIssue
        }
    }, { new: true });

    if (!updatedEvent) {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update event",
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            message: "Certificate issued successfully",
            data: updatedEvent,
        },
        { status: 200 }
    );
 } catch (error) {
    return NextResponse.json({
        success: false,
        message: "Internal server error",
    }, {
        status: 500
    });
 }
    
}
