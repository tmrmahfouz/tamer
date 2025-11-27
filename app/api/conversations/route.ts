import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET - Get all conversations for current user
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
    const userId = decoded.userId

    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      conversations: conversations || [],
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المحادثات' },
      { status: 500 }
    )
  }
}

// POST - Create a new conversation
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
    const { participantIds, type, title, courseId } = body

    // Check if conversation already exists (for direct messages)
    if (type === 'direct' && participantIds.length === 1) {
      const existingConv = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId, participantIds[0]], $size: 2 },
      })

      if (existingConv) {
        return NextResponse.json({
          success: true,
          conversation: existingConv,
          isExisting: true,
        })
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [userId, ...participantIds],
      type: type || 'direct',
      title,
      course: courseId,
    })

    await conversation.populate('participants', 'name email role')

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المحادثة بنجاح',
        conversation,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء المحادثة' },
      { status: 500 }
    )
  }
}
