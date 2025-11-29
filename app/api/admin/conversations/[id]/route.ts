import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import User from '@/models/User'

// DELETE - Delete a conversation (admin only)
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

    // Check if user is admin
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - للمدراء فقط' },
        { status: 403 }
      )
    }

    const { id } = params

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: id })

    // Delete the conversation
    await Conversation.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'تم حذف المحادثة بنجاح'
    })
  } catch (error: any) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف المحادثة' },
      { status: 500 }
    )
  }
}
