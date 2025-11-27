import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST terminate all sessions except current
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // إنهاء جميع الجلسات ماعدا الحالية
    await Session.updateMany(
      {
        user: decoded.userId,
        token: { $ne: token },
        isActive: true,
      },
      { isActive: false }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنهاء جميع الجلسات الأخرى',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Terminate all sessions error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
