import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'user';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(500, parseInt(searchParams.get('limit') || '10'));
    const skip = (page - 1) * limit;

    let query: any = { role };
    if (search) {
      // Split search into words and search for each part
      const searchWords = search.trim().split(/\s+/);
      const searchRegex = searchWords.join('|'); // OR condition for any word

      query = {
        $and: [
          { role },
          {
            $or: [
              { name: { $regex: searchRegex, $options: 'i' } },
              { email: { $regex: searchRegex, $options: 'i' } },
              { userId: { $regex: searchRegex, $options: 'i' } },
            ]
          }
        ]
      };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
