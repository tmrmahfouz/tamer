import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import PaymentGateway from '@/models/PaymentGateway'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Step 1: Connect to DB
    await connectDB()

    // Step 2: Verify token
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Step 3: Get request data
    const body = await request.json()
    const { courseId, bundleId, type, amount, originalAmount, discount, paymentMethod, phoneNumber, referenceNumber, paymentProof, couponCode } = body

    // Step 4: Get payment gateway to get the type
    const gateway = await PaymentGateway.findById(paymentMethod)
    if (!gateway) {
      return NextResponse.json({ 
        success: false, 
        message: 'طريقة الدفع غير صحيحة' 
      }, { status: 400 })
    }

    // Step 5: Create payment data
    const paymentData: any = {
      user: decoded.userId,
      amount,
      originalAmount: originalAmount || amount,
      discount: discount || 0,
      couponCode: couponCode || '',
      method: gateway.type,
      phoneNumber: phoneNumber || '',
      referenceNumber: referenceNumber || '',
      paymentProof: paymentProof || '',
      status: 'pending',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    // Add course or bundle based on type
    if (type === 'bundle' && bundleId) {
      paymentData.bundle = bundleId
      paymentData.type = 'bundle'
    } else if (courseId) {
      paymentData.course = courseId
      paymentData.type = 'course'
    }

    const payment = new Payment(paymentData)
    await payment.save()
    
    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الدفع بنجاح',
      payment: {
        _id: payment._id,
        status: 'pending'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'خطأ: ' + error.message
    }, { status: 500 })
  }
}
