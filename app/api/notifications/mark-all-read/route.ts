import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST mark all as read
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

    await Notification.updateMany(
      { user: decoded.userId, read: false },
      { read: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم وضع علامة مقروء على جميع الإشعارات',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
