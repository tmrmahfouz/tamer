import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('Connecting to DB...')
    await connectDB()
    console.log('DB connected')

    const token = request.cookies.get('token')?.value
    if (!token) {
      console.log('No token found')
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    console.log('Verifying token...')
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('Token decoded, role:', decoded.role)
    
    if (decoded.role !== 'admin') {
      console.log('Not admin role')
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    console.log('Fetching payments...')
    const payments = await Payment.find()
      .populate({ path: 'user', select: 'name email', strictPopulate: false })
      .populate({ path: 'course', select: 'title price', strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean()

    console.log('Payments fetched successfully:', payments.length)
    return NextResponse.json({ success: true, payments }, { status: 200 })
  } catch (error: any) {
    console.error('=== Get payments error ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('========================')
    
    return NextResponse.json({ 
      success: false, 
      message: 'حدث خطأ في جلب البيانات', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  }
}
