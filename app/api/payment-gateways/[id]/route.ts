console.log('🚀 Loading payment-gateways/[id]/route.ts')

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentGateway from '@/models/PaymentGateway'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

console.log('✅ All imports loaded successfully')

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

console.log('📝 Defining PUT function...')

// PUT - Update payment gateway (admin only)
export async function PUT(request: NextRequest, props: any) {
  console.log('🔥 PUT started')
  console.log('Props:', props)
  
  try {
    console.log('Step 1: Getting params')
    const params = props.params
    const id = params.id
    console.log('ID:', id)
    
    console.log('Step 2: Connecting to DB')
    await connectDB()
    console.log('Step 3: DB connected')
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'معرف غير صحيح' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name, type, isActive, accountNumber, accountName,
      bankName, iban, merchantCode, instructions,
      feesType, feesValue, minAmount, maxAmount
    } = body

    const gateway = await PaymentGateway.findByIdAndUpdate(
      id,
      {
        name, type, isActive,
        config: { accountNumber, accountName, bankName, iban, merchantCode, instructions },
        fees: { type: feesType, value: feesValue },
        minAmount, maxAmount
      },
      { new: true, runValidators: true }
    )

    if (!gateway) {
      return NextResponse.json({ success: false, message: 'بوابة الدفع غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم تحديث بوابة الدفع بنجاح', gateway }, { status: 200 })
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, message: `خطأ: ${error.message}` }, { status: 500 })
  }
}

// DELETE - Delete payment gateway (admin only)
export async function DELETE(request: NextRequest, props: any) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const params = props.params
    const id = params.id
    const gateway = await PaymentGateway.findByIdAndDelete(id)

    if (!gateway) {
      return NextResponse.json({ success: false, message: 'بوابة الدفع غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف بوابة الدفع بنجاح' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
