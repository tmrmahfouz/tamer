import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Reminder from '@/models/Reminder'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET user reminders
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

    const reminders = await Reminder.find({
      user: decoded.userId,
      sent: false,
    }).sort({ scheduledFor: 1 })

    return NextResponse.json(
      {
        success: true,
        reminders,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get reminders error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
