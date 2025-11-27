import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentGateway from '@/models/PaymentGateway'
import { verifyToken } from '@/lib/jwt'

const defaultGateways = [
  {
    name: 'فودافون كاش',
    type: 'vodafone_cash' as const,
    isActive: true,
    config: {
      accountNumber: '01012345678',
      accountName: 'تامر محفوظ',
      instructions: 'قم بتحويل المبلغ على رقم فودافون كاش: 01012345678 ثم أرسل صورة الإيصال',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'انستاباي',
    type: 'instapay' as const,
    isActive: true,
    config: {
      accountName: '@tamermahfouz',
      instructions: 'استخدم اسم المستخدم: @tamermahfouz على انستاباي وأرسل رقم المرجع',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'فوري',
    type: 'fawry' as const,
    isActive: true,
    config: {
      merchantCode: '12345',
      instructions: 'ادفع من خلال فوري باستخدام كود التاجر: 12345 وأرسل رقم المرجع',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'تحويل بنكي',
    type: 'bank_transfer' as const,
    isActive: true,
    config: {
      bankName: 'البنك الأهلي المصري',
      accountName: 'تامر محفوظ',
      accountNumber: '1234567890',
      iban: 'EG380002000156789012345180002',
      instructions: 'قم بالتحويل على الحساب البنكي وأرسل صورة الإيصال',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
]

// POST - Seed default payment gateways (admin only)
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

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - يجب أن تكون مدير' },
        { status: 403 }
      )
    }

    // Check if gateways already exist
    const existingCount = await PaymentGateway.countDocuments()
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `يوجد ${existingCount} بوابات دفع بالفعل. احذفها أولاً إذا أردت إعادة الإنشاء.`,
      })
    }

    // Create default gateways
    const created = []
    for (const gateway of defaultGateways) {
      const newGateway = await PaymentGateway.create(gateway)
      created.push(newGateway.name)
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء بوابات الدفع الافتراضية بنجاح',
      created,
    })
  } catch (error: any) {
    console.error('Seed payment gateways error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ: ' + error.message },
      { status: 500 }
    )
  }
}
