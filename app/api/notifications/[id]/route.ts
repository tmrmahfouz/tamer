import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// PATCH mark as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, user: decoded.userId },
      { read: true },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'الإشعار غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notification = await Notification.findOneAndDelete({
      _id: params.id,
      user: decoded.userId,
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'الإشعار غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الإشعار',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
