import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST reject payment (admin only)
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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const payment = await Payment.findById(params.id)
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'الدفعة غير موجودة' },
        { status: 404 }
      )
    }

    // Update payment status
    payment.status = 'rejected'
    await payment.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم رفض الدفعة',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reject payment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
