import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import SupportTicket from '@/models/SupportTicket'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET single ticket
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

    const ticket = await SupportTicket.findById(params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .populate('messages.sender', 'name')
      .lean()

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'التذكرة غير موجودة' },
        { status: 404 }
      )
    }

    // Check permission
    if (decoded.role !== 'admin' && ticket.user._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        ticket,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get ticket error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// PUT update ticket (admin only)
export async function PUT(
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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, priority, assignedTo } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date()
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('user', 'name email')
      .populate('assignedTo', 'name')

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'التذكرة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث التذكرة بنجاح',
        ticket,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE ticket (admin only)
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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const ticket = await SupportTicket.findByIdAndDelete(params.id)

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'التذكرة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف التذكرة بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete ticket error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
