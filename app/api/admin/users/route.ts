import { User } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { managedEvents } = await req.json();

        if (!managedEvents || !Array.isArray(managedEvents) || managedEvents.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Event details required"
            }, { status: 400 });
        }

        // Extract event codes from managedEvents
        const eventCodes = managedEvents.map((event: any) => event.eventCode);
        
        // Fetch all users who have applied for any of the assigned events
        const users = await User.find({ 
            role: { $in: ['user', 'guest', 'organizer'] },
            eventApplied: { 
                $elemMatch: { 
                    eventCode: { $in: eventCodes } 
                } 
            } 
        }).lean();

        return NextResponse.json({
            success: true,
            data: users,
            message: `Found ${users.length} users for assigned events`
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error in finding users", error);
        return NextResponse.json({
            success: false,
            message: "Error in finding users"
        }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    console.log('API Request URL:', req.url);
    console.log('API Search Params:', Object.fromEntries(searchParams.entries()));

    // Frontend sends: params: { managedEvents: ['EVT001', 'EVT002'] }
    // Next.js parses repeated keys as array automatically
    const eventCodes = searchParams.getAll('managedEvents');
    const search     = searchParams.get('search') || '';
    
    console.log('Extracted Event Codes:', eventCodes);
    console.log('Search Query:', search);

    if (!eventCodes || eventCodes.length === 0) {
      console.log('No event codes provided in request');
      return NextResponse.json({
        success: false,
        message: "No event codes provided"
      }, { status: 400 });
    }

    // Build query
    const query: Record<string, any> = {
      role: { $in: ['user', 'guest', 'organizer'] },
      eventApplied: {
        $elemMatch: {
          eventCode: { $in: eventCodes }
        }
      }
    };

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    // Optional search filter
    if (search) {
      query.$or = [
        { name:   { $regex: search, $options: 'i' } },
        { email:  { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).lean();
    console.log('Users found:', users.length);

    return NextResponse.json({
      success: true,
      data: users,
      message: `Found ${users.length} users`
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}