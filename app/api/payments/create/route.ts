import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()
    const { courseId, amount, method, phoneNumber } = body

    // Create payment record
    const payment = await Payment.create({
      user: decoded.userId,
      course: courseId,
      amount,
      method,
      phoneNumber,
      status: 'pending',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    // In production, integrate with actual payment gateways:
    // - Vodafone Cash API
    // - InstaPay API
    // - Fawry API
    // For now, we'll simulate a reference number

    const referenceNumber = `REF-${Date.now()}`

    await Payment.findByIdAndUpdate(payment._id, {
      referenceNumber,
      paymentDetails: {
        method,
        phoneNumber,
        timestamp: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء عملية الدفع بنجاح',
        payment: {
          _id: payment._id,
          referenceNumber,
          amount,
          method,
          status: 'pending',
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء عملية الدفع' },
      { status: 500 }
    )
  }
}
