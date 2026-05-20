import { connectDB, isUsingFallbackMode } from '@/lib/db';
import { Question } from '@/lib/models';
import { isUserAuthenticated, isAdminAuthenticated, getUserInfo } from '@/lib/auth';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

interface QuestionRequest {
  text?: string;
  eventId?: string;
  status?: 'active' | 'answered' | 'removed' | 'pending';
}

import mongoose from 'mongoose';
import { getServerUser } from '@/lib/server-auth';

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

export async function POST(req: NextRequest) {
  try {
 
    const body: QuestionRequest = await req.json();
    const { text } = body;

    const eventId = req.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required in query params' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Get user information from session
    let currentUser = null;
    // if (isUserAuth) {
    //   currentUser = await getUserInfo();
    //   if (!currentUser) {
    //     return NextResponse.json(
    //       { error: 'User information not found' },
    //       { status: 401 }
    //     );
    //   }
    // }

    // Check if question already exists
    const existingQuestion = await Question.findOne({
      text: { $regex: `^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });

    if (existingQuestion) {
      return NextResponse.json({
        success: true,
        data: existingQuestion,
        message: 'Question already exists'
      });
    }

    const newQuestion = new Question({
      eventId,
      text: text.trim(),
      upVotes: 0,
      replies: [],
      userId: user._id,
      userName: user.name,
      userDepartment: user.department,
      status: 'active'
    });

    const savedQuestion = await newQuestion.save();

    return NextResponse.json({
      success: true,
      data: savedQuestion,
      message: 'Question created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create question. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check authentication (both user and admin can access)
    const isUserAuth = await isUserAuthenticated();
    const isAdminAuth = await isAdminAuthenticated();

    if (!isUserAuth && !isAdminAuth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.', redirectTo: '/login' },
        { status: 401 }
      );
    }

    const body: QuestionRequest = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Question status is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user information from session
    let currentUser = null;
    if (isUserAuth) {
      currentUser = await getUserInfo();
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User information not found' },
          { status: 401 }
        );
      }
    }

    // Update only active questions' status
    const updatedQuestions = await Question.updateMany(
      { $or: [{ status: 'active' }, { status: { $exists: false } }, { status: null }] },
      { status: status },
      { runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: { modifiedCount: updatedQuestions.modifiedCount },
      message: `Active questions updated to ${status}`
    });
  } catch (error) {
    console.error('Create question error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create question. Please try again later.' },
      { status: 500 }
    );
  }
}
