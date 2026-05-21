import { NextResponse, NextRequest } from "next/server";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/lib/models/Event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const event = await EventModel.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const registrationUrl = `${baseUrl}/event/${id}/register`;

    const qrPngBuffer = await QRCode.toBuffer(registrationUrl, {
      type: "png",
      width: 400,
      margin: 2
    });

    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${event.eventCode || "event"}-registration-qr.png"`
    );

    return new Response(qrPngBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error generating registration QR code:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}