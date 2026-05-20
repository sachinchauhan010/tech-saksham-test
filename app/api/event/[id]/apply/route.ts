import { connectDB } from "@/lib/db";
import { NextRequest } from "next/server";
import { EventModel } from "@/lib/models/Event";
import { getServerUser } from "@/lib/server-auth";
import { User } from "@/lib/models";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await connectDB();
        const { id } = await params;
        const user = await getServerUser(request);

        if (!user) {
            return Response.json(
                { success: false, message: "User not found", data: null },
                { status: 401 },
            );
        }

        // ✅ 1. Find event FIRST
        const event = await EventModel.findById(id);

        // ✅ 2. Then check if it exists
        if (!event) {
            return Response.json(
                { success: false, message: "Event not found", data: null },
                { status: 404 },
            );
        }

        // ✅ 3. Only NOW it's safe to access event.eventCode
        const isApplied = user.eventApplied.some(
            (e: any) => e.eventId?.toString() === event._id.toString() || e.eventCode === event.eventCode
        );

        if (isApplied) {
            return Response.json(
                { success: true, message: "Already applied for this event", data: null },
                { status: 200 },
            );
        }

        const applyEvent = await User.updateOne(
            { email: user.email },
            {
                $push: {
                    eventApplied: {
                        eventId: event._id,
                        eventCode: event.eventCode,
                    },
                },
            },
        );

        return Response.json(
            { success: true, message: "Event applied successfully", data: applyEvent },
            { status: 200 },
        );

    } catch (error) {
        console.error("Error applying for event:", error);
        return Response.json(
            {
                success: false,
                message: "Failed to apply for event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}


export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await connectDB();
		const { id } = await params;
		const user = await getServerUser(request);

		if (!user) {
			return Response.json(
				{ success: false, message: "User not found", data: null },
				{ status: 401 },
			);
		}

		const event = await EventModel.findById(id);

		if (!event) {
			return Response.json(
				{ success: false, message: "Event not found", data: null },
				{ status: 404 },
			);
		}

		const isApplied = user.eventApplied.some((e: any) => e.eventId?.toString() === event._id.toString() || e.eventCode === event.eventCode);

		if (isApplied) {
			return Response.json(
				{ success: true, message: "Already applied for this event", data: user.eventApplied },
				{ status: 200 },
			);
		}

		// handled above

		return Response.json(
			{ success: true, message: "Event applied successfully", data: user.eventApplied },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error applying for event:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to apply for event",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await connectDB();
		const { id } = await params;
		const user = await getServerUser(request);

		if (!user) {
			return Response.json(
				{ success: false, message: "User not found", data: null },
				{ status: 401 },
			);
		}

		const event = await EventModel.findById(id);

		if (!event) {
			return Response.json(
				{ success: false, message: "Event not found", data: null },
				{ status: 404 },
			);
		}

		const isApplied = user.eventApplied.some((e: any) => e.eventId?.toString() === event._id.toString() || e.eventCode === event.eventCode);

		if (!isApplied) {
			return Response.json(
				{ success: true, message: "Not applied for this event", data: user.eventApplied },
				{ status: 200 },
			);
		}

		// handled above

		const removeEvent = await User.updateOne(
			{ email: user.email },
			{
				$pull: {
					eventApplied: {
						eventCode: event.eventCode
					}
				}
			}
		);

		if (!removeEvent) {
			return Response.json(
				{ success: false, message: "Failed to remove application", data: null },
				{ status: 500 },
			);
		}

		return Response.json(
			{ success: true, message: "Application removed successfully", data: removeEvent },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error removing application:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to remove application",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}