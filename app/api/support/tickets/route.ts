import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import SupportTicket from '@/models/SupportTicket'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET user tickets or all tickets (admin)
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let query: any = {}

    // If not admin, only show user's tickets
    if (decoded.role !== 'admin') {
      query.user = decoded.userId
    }

    if (status) query.status = status
    if (category) query.category = category

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .populate('messages.sender', 'name')
      .sort({ updatedAt: -1 })
      .lean()

    // Calculate statistics
    const stats = {
      total: await SupportTicket.countDocuments(decoded.role === 'admin' ? {} : { user: decoded.userId }),
      open: await SupportTicket.countDocuments({ ...query, status: 'open' }),
      inProgress: await SupportTicket.countDocuments({ ...query, status: 'in_progress' }),
      resolved: await SupportTicket.countDocuments({ ...query, status: 'resolved' }),
      closed: await SupportTicket.countDocuments({ ...query, status: 'closed' }),
    }

    return NextResponse.json(
      {
        success: true,
        tickets,
        stats
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST create ticket
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { subject, category, priority, message } = body

    if (!subject || !category || !message) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const ticket = await SupportTicket.create({
      user: decoded.userId,
      subject,
      category,
      priority: priority || 'medium',
      status: 'open',
      messages: [
        {
          sender: decoded.userId,
          senderRole: decoded.role,
          message,
          createdAt: new Date(),
        },
      ],
    })

    await ticket.populate('user', 'name email')

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء التذكرة بنجاح',
        ticket,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
