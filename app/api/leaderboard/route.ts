import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserStats from '@/models/UserStats'

// GET leaderboard
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'points' // points, courses, streak
    const limit = parseInt(searchParams.get('limit') || '10')

    let sortField = 'totalPoints'
    if (type === 'courses') sortField = 'coursesCompleted'
    if (type === 'streak') sortField = 'longestStreak'

    const leaderboard = await UserStats.find()
      .populate('user', 'name avatar')
      .sort({ [sortField]: -1 })
      .limit(limit)

    return NextResponse.json(
      {
        success: true,
        leaderboard,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
