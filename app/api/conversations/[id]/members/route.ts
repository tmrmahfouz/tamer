import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Add members to group
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const userId = decoded.userId

    const conversation = await Conversation.findById(params.id)
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    if (conversation.type !== 'group') {
      return NextResponse.json(
        { success: false, message: 'هذه ليست محادثة جماعية' },
        { status: 400 }
      )
    }

    // Check if user is participant
    if (!conversation.participants.includes(userId)) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userIds } = body

    if (!userIds || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'يجب تحديد مستخدمين' },
        { status: 400 }
      )
    }

    // Add new participants
    const newParticipants = [...new Set([...conversation.participants, ...userIds])]
    conversation.participants = newParticipants
    await conversation.save()

    await conversation.populate('participants', 'name email role')

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الأعضاء بنجاح',
      conversation,
    })
  } catch (error: any) {
    console.error('Error adding members:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الأعضاء' },
      { status: 500 }
    )
  }
}

// DELETE - Remove member from group
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
    const userId = decoded.userId

    const conversation = await Conversation.findById(params.id)
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    if (conversation.type !== 'group') {
      return NextResponse.json(
        { success: false, message: 'هذه ليست محادثة جماعية' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberIdToRemove = searchParams.get('userId')

    if (!memberIdToRemove) {
      return NextResponse.json(
        { success: false, message: 'يجب تحديد المستخدم' },
        { status: 400 }
      )
    }

    // Remove participant
    conversation.participants = conversation.participants.filter(
      (p: any) => p.toString() !== memberIdToRemove
    )
    await conversation.save()

    await conversation.populate('participants', 'name email role')

    return NextResponse.json({
      success: true,
      message: 'تم إزالة العضو بنجاح',
      conversation,
    })
  } catch (error: any) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إزالة العضو' },
      { status: 500 }
    )
  }
}
