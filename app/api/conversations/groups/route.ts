import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Create a group conversation
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
    const userId = decoded.userId

    const body = await request.json()
    const { title, participantIds, courseId } = body

    if (!title || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'العنوان والمشاركين مطلوبين' },
        { status: 400 }
      )
    }

    // Create group conversation
    const conversation = await Conversation.create({
      participants: [userId, ...participantIds],
      type: 'group',
      title,
      course: courseId,
    })

    await conversation.populate('participants', 'name email role')
    if (courseId) {
      await conversation.populate('course', 'title')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المجموعة بنجاح',
        conversation,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء المجموعة' },
      { status: 500 }
    )
  }
}
