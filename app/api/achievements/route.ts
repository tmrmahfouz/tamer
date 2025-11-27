import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Achievement from '@/models/Achievement'
import UserStats from '@/models/UserStats'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET user achievements and stats
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // جلب الإنجازات
    const achievements = await Achievement.find({ user: decoded.userId }).sort({
      unlockedAt: -1,
    })

    // جلب الإحصائيات
    let stats = await UserStats.findOne({ user: decoded.userId })
    if (!stats) {
      stats = await UserStats.create({ user: decoded.userId })
    }

    return NextResponse.json(
      {
        success: true,
        achievements,
        stats,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
