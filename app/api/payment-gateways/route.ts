import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentGateway from '@/models/PaymentGateway'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

// GET all payment gateways (admin gets all, students get active only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Check if admin
    const token = request.cookies.get('token')?.value
    let isAdmin = false
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        isAdmin = decoded.role === 'admin'
      } catch (error) {
        // Not admin, continue as student
      }
    }

    // Admin gets all gateways, students get only active ones
    const query = isAdmin ? {} : { isActive: true }
    const gateways = await PaymentGateway.find(query)
      .select(isAdmin ? '' : '-config.apiKey -config.secretKey')
      .sort({ name: 1 })
      .lean()

    return NextResponse.json(
      {
        success: true,
        gateways,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get payment gateways error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST - Create new payment gateway (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check authentication
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

    const body = await request.json()
    const {
      name,
      type,
      isActive,
      accountNumber,
      accountName,
      bankName,
      iban,
      merchantCode,
      instructions,
      feesType,
      feesValue,
      minAmount,
      maxAmount,
    } = body

    const gateway = await PaymentGateway.create({
      name,
      type,
      isActive,
      config: {
        accountNumber,
        accountName,
        bankName,
        iban,
        merchantCode,
        instructions,
      },
      fees: {
        type: feesType,
        value: feesValue,
      },
      minAmount,
      maxAmount,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة بوابة الدفع بنجاح',
        gateway,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create payment gateway error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
