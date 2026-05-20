import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { Question } from '@/lib/models';
import { isUserAuthenticated, getUserInfo } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // Validate status
    if (!['active', 'answered', 'removed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, answered, or removed' },
        { status: 400 }
      );
    }

    await connectDB();

    // If in fallback mode, simulate update
    if (isUsingFallbackMode()) {
      return NextResponse.json({
        success: true,
        message: 'Question status updated successfully (offline mode)',
        data: { _id: id, status, updatedAt: new Date().toISOString() },
        fallback: true
      });
    }

    // For real database, validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findById(id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Question status updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question status error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update question status. Please try again later.' },
      { status: 500 }
    );
  }
}
