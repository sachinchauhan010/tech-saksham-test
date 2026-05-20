import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Fetch all users regardless of role or events
    const users = await User.find({}).lean();
    
    return NextResponse.json({
      success: true,
      data: users,
      message: `Found ${users.length} users`
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}
