import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Reminder from '@/models/Reminder'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// DELETE cancel reminder
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

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const reminder = await Reminder.findOne({
      _id: params.id,
      user: decoded.userId,
    })

    if (!reminder) {
      return NextResponse.json(
        { success: false, message: 'التذكير غير موجود' },
        { status: 404 }
      )
    }

    await reminder.deleteOne()

    return NextResponse.json(
      {
        success: true,
        message: 'تم إلغاء التذكير',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete reminder error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
