import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CertificateSettings } from '@/lib/models';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Get certificate settings from database
    const settings = await CertificateSettings.findOne({});

    // If no settings exist, return default values
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: true,
          allowDownload: true,
          message: ''
        }
      });
    }

    // Return only the necessary permissions for delegates
    return NextResponse.json({
      success: true,
      data: {
        enabled: settings.enabled,
        allowDownload: settings.allowDownload,
        message: settings.message || ''
      }
    });
  } catch (error) {
    console.error('Error fetching certificate permissions:', error);
    
    // Return default permissions on error to allow basic functionality
    return NextResponse.json({
      success: true,
      data: {
        enabled: true,
        allowDownload: true,
        message: ''
      }
    });
  }
}
