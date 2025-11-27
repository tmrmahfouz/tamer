import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST mark notification as read
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
    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      // Mark all notifications as read
      await Notification.updateMany(
        { user: decoded.userId, read: false },
        { read: true }
      )
    } else if (notificationId) {
      // Mark single notification as read
      await Notification.findByIdAndUpdate(notificationId, { read: true })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الإشعارات',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Mark read error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
