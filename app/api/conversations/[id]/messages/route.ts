import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET - Get messages for a conversation
export async function GET(
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
    const userId = decoded.userId

    // Check if user is participant
    const conversation = await Conversation.findById(params.id)
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    if (!conversation.participants.includes(userId)) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const messages = await Message.find({
      conversation: params.id,
      isDeleted: false,
    })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Message.countDocuments({
      conversation: params.id,
      isDeleted: false,
    })

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: params.id,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    )

    // Reset unread count
    const unreadCount = conversation.unreadCount || new Map()
    unreadCount.set(userId.toString(), 0)
    await Conversation.findByIdAndUpdate(params.id, { unreadCount })

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الرسائل' },
      { status: 500 }
    )
  }
}

// POST - Send a message
export async function POST(
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
    const userId = decoded.userId

    // Check if user is participant
    const conversation = await Conversation.findById(params.id)
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    if (!conversation.participants.includes(userId)) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const message = await Message.create({
      conversation: params.id,
      sender: userId,
      content: body.content,
      type: body.type || 'text',
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
    })

    await message.populate('sender', 'name email role')

    // Update conversation
    const unreadCount = conversation.unreadCount || new Map()
    conversation.participants.forEach((participantId: any) => {
      if (participantId.toString() !== userId.toString()) {
        const current = unreadCount.get(participantId.toString()) || 0
        unreadCount.set(participantId.toString(), current + 1)
      }
    })

    await Conversation.findByIdAndUpdate(params.id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      unreadCount,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال الرسالة بنجاح',
        data: message,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    )
  }
}
