import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all user sessions
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

    const sessions = await Session.find({
      user: decoded.userId,
      isActive: true,
    }).sort({ lastActivity: -1 })

    // تحديد الجلسة الحالية
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session.toObject(),
      isCurrent: session.token === token,
    }))

    return NextResponse.json(
      {
        success: true,
        sessions: sessionsWithCurrent,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
