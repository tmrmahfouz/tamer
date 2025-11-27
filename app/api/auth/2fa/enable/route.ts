import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TwoFactorAuth from '@/models/TwoFactorAuth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST enable 2FA
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

    const twoFA = await TwoFactorAuth.findOne({ user: decoded.userId })
    
    if (!twoFA) {
      return NextResponse.json(
        { success: false, message: 'يجب إعداد 2FA أولاً' },
        { status: 400 }
      )
    }

    twoFA.enabled = true
    await twoFA.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم تفعيل 2FA بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Enable 2FA error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
