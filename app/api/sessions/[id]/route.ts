import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// DELETE terminate specific session
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

    const session = await Session.findOne({
      _id: params.id,
      user: decoded.userId,
    })

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'الجلسة غير موجودة' },
        { status: 404 }
      )
    }

    // منع حذف الجلسة الحالية
    if (session.token === token) {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف الجلسة الحالية' },
        { status: 400 }
      )
    }

    session.isActive = false
    await session.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنهاء الجلسة',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete session error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
