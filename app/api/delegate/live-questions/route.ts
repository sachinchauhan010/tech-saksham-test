import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { Question } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

interface QuestionRequest {
  text?: string;
  eventId?: string;
  status?: 'active' | 'answered' | 'removed' | 'pending';
}

import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {

    await connectDB();

    const eventId = req.nextUrl.searchParams.get('eventId');
    const matchStage = eventId 
      ? { $match: { eventId: new mongoose.Types.ObjectId(eventId) } } 
      : { $match: {} };

    const questions = await Question.aggregate([
      matchStage,
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'userId',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          text: 1,
          upVotes: 1,
          createdAt: 1,
          userId: 1,
          eventId: 1,
          userName: { $ifNull: ['$user.name', 'Unknown User'] },
          userDepartment: { $ifNull: ['$user.department', 'Unknown Department'] },
          status: 1
        }
      },
      {
        $sort: { upVotes: -1, createdAt: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch questions. Please try again later.' },
      { status: 500 }
    );
  }
}
