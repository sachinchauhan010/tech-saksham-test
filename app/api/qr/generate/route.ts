import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { QRToken } from '@/lib/models/QRToken';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const { userId, email } = await request.json();

    await connectDB();

    // Atomically find an existing token or create a new one
    // This prevents race conditions when two requests hit this API concurrently
    const userTokenExist = await QRToken.findOneAndUpdate(
      { $or: [{ userId: userId }, { email: email }], status: 'pending' },
      {
        $setOnInsert: {
          token: uuidv4(),
          userId: userId,
          email: email
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const qrData = `${baseUrl}/qr-login?token=${userTokenExist.token}`;
    const qrImage = await QRCode.toDataURL(qrData);

    return NextResponse.json({
      success: true,
      token: userTokenExist.token,
      qrImage: qrImage
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
    
  }
}
