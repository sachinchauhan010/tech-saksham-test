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
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // If in fallback mode, simulate update
    if (isUsingFallbackMode()) {
      return NextResponse.json({
        success: true,
        message: 'Question updated successfully (offline mode)',
        data: { _id: id, text: text.trim(), updatedAt: new Date().toISOString() },
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

    // Check ownership (only question owner can edit)
    const currentUser = await getUserInfo();
    if (!currentUser || question.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own questions' },
        { status: 403 }
      );
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        text: text.trim(),
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update question. Please try again later.' },
      { status: 500 }
    );
  }
}
