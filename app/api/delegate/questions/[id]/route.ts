import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { Question } from '@/lib/models';
import { isUserAuthenticated, isAdminAuthenticated, getUserInfo } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication (both user and admin can delete)
    const isUserAuth = await isUserAuthenticated();
    const isAdminAuth = await isAdminAuthenticated();

    if (!isUserAuth && !isAdminAuth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    await connectDB();

    // If in fallback mode, simulate deletion
    if (isUsingFallbackMode()) {
      return NextResponse.json({
        success: true,
        message: 'Question deleted successfully (offline mode)',
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

    // Check ownership (only admin or question owner can delete)
    if (!isAdminAuth && isUserAuth) {
      const currentUser = await getUserInfo();
      if (!currentUser || question.userId !== currentUser.userId) {
        return NextResponse.json(
          { error: 'You can only delete your own questions' },
          { status: 403 }
        );
      }
    }

    const deletedQuestion = await Question.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
      data: deletedQuestion
    });
  } catch (error) {
    console.error('Delete question error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete question. Please try again later.' },
      { status: 500 }
    );
  }
}
