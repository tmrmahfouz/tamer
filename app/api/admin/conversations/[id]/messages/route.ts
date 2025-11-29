import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import User from '@/models/User'

// GET - Get messages for a conversation (admin only)
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - للمدراء فقط' },
        { status: 403 }
      )
    }

    const { id } = params

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({
      success: true,
      messages: messages.reverse()
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الرسائل' },
      { status: 500 }
    )
  }
}
