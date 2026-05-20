import { connectDB } from "@/lib/db";
import { EventModel } from "@/lib/models/Event";
import { EVENT_STATUS } from "@/lib/enum";

export async function GET() {
  try {
    await connectDB();

    const allEvents = await EventModel.find({});

    if (!allEvents || allEvents.length === 0) {
      return Response.json({ 
        success: true,
        message: "No events found",
        data: { upcomingEvents: [], pastEvents: [] }
      }, { status: 200 });
    }

    const upcomingEvents = allEvents.filter(
      (event: any) => new Date(event.startDate) > new Date(),
    );
    const pastEvents = allEvents.filter(
      (event: any) => new Date(event.startDate) <= new Date(),
    );

      const visibleUpcoming = upcomingEvents.filter(
        (e) => e.status !== EVENT_STATUS.DRAFT
      );
      const visibleCompleted = pastEvents.filter(
        (e) => e.status !== EVENT_STATUS.DRAFT
      );
    

    return Response.json({ 
      success: true,
      message: "Events retrieved successfully",
      data: { 
        upcomingEvents: visibleUpcoming || [], 
        pastEvents: visibleCompleted || [] 
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ 
      success: false,
      message: "Failed to fetch events",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
