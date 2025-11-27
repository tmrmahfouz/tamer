import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import SupportTicket from '@/models/SupportTicket'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST add message to ticket
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
    const body = await request.json()
    const { message, attachments } = body

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'الرسالة مطلوبة' },
        { status: 400 }
      )
    }

    const ticket = await SupportTicket.findById(params.id)

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'التذكرة غير موجودة' },
        { status: 404 }
      )
    }

    // Check permission
    if (decoded.role !== 'admin' && ticket.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Add message
    ticket.messages.push({
      sender: decoded.userId,
      senderRole: decoded.role,
      message,
      attachments: attachments || [],
      createdAt: new Date(),
    } as any)

    // Update ticket status if it was closed
    if (ticket.status === 'closed') {
      ticket.status = 'open'
    }

    await ticket.save()
    await ticket.populate('messages.sender', 'name')

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الرسالة بنجاح',
        ticket,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Add message error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
