import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET user notifications
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const query: any = { user: decoded.userId }
    if (unreadOnly) {
      query.read = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({
      user: decoded.userId,
      read: false,
    })

    // For admin, add pending enrollments and payments as notifications
    let adminNotifications: any[] = []
    if (decoded.role === 'admin') {
      const Enrollment = (await import('@/models/Enrollment')).default
      const Payment = (await import('@/models/Payment')).default
      
      const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' })
      const pendingPayments = await Payment.countDocuments({ status: 'pending' })
      
      if (pendingEnrollments > 0) {
        adminNotifications.push({
          type: 'enrollment',
          title: 'تسجيلات معلقة',
          message: `لديك ${pendingEnrollments} تسجيل معلق`,
          count: pendingEnrollments
        })
      }
      
      if (pendingPayments > 0) {
        adminNotifications.push({
          type: 'payment',
          title: 'مدفوعات معلقة',
          message: `لديك ${pendingPayments} دفعة معلقة`,
          count: pendingPayments
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        notifications: [...adminNotifications, ...notifications],
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإشعارات' },
      { status: 500 }
    )
  }
}

// POST create notification (للاستخدام الداخلي)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId, type, title, message, link } = body

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    })

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الإشعار' },
      { status: 500 }
    )
  }
}
