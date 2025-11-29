import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import User from '@/models/User'

// GET - Get all conversations (admin only)
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

    // Get all conversations with populated participants
    const conversations = await Conversation.find()
      .populate('participants', 'name email role')
      .sort({ lastMessageAt: -1 })
      .lean()

    // Get message counts
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv: any) => {
        const messagesCount = await Message.countDocuments({ conversation: conv._id })
        return { ...conv, messagesCount }
      })
    )

    // Calculate stats
    const totalMessages = await Message.countDocuments()
    const stats = {
      total: conversations.length,
      direct: conversations.filter((c: any) => c.type === 'direct').length,
      groups: conversations.filter((c: any) => c.type === 'group').length,
      totalMessages
    }

    return NextResponse.json({
      success: true,
      conversations: conversationsWithCounts,
      stats
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المحادثات' },
      { status: 500 }
    )
  }
}
