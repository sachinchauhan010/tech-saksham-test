import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CertificateSettings } from '@/lib/models';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Get or create settings from database
    let settings = await CertificateSettings.findOneAndUpdate(
      {}, // filter
      { $setOnInsert: { enabled: true, allowDownload: true, message: '' } }, // update
      { upsert: true, returnDocument: 'after' } // options
    );

    return NextResponse.json({
      success: true,
      data: {
        enabled: settings.enabled,
        allowDownload: settings.allowDownload,
        message: settings.message
      }
    });
  } catch (error) {
    console.error('Error fetching certificate settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificate settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { enabled, allowDownload, message } = body;

    if (typeof enabled !== 'boolean' || typeof allowDownload !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings: enabled and allowDownload must be boolean values' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update settings in database using upsert
    const settings = await CertificateSettings.findOneAndUpdate(
      {}, // filter
      { enabled, allowDownload, message: message || '' }, // update
      { upsert: true, returnDocument: 'after' } // options
    );

    return NextResponse.json({
      success: true,
      data: {
        enabled: settings.enabled,
        allowDownload: settings.allowDownload,
        message: settings.message
      }
    });
  } catch (error) {
    console.error('Error updating certificate settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
