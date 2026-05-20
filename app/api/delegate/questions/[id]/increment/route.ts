import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { Question } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // For real database, validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { $inc: { upVotes: 1 } },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Increment upVotes error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record vote. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // For real database, validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    // First, get the current question to check vote count
    const currentQuestion = await Question.findById(id);

    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Prevent decrementing below 0
    if (currentQuestion.upVotes <= 0) {
      return NextResponse.json(
        { error: 'Cannot remove upvote: vote count is already 0' },
        { status: 400 }
      );
    }

    // Now safely decrement the vote
    const question = await Question.findByIdAndUpdate(
      id,
      { $inc: { upVotes: -1 } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Decrement upVotes error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record vote. Please try again later.' },
      { status: 500 }
    );
  }
}
