import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TwoFactorAuth from '@/models/TwoFactorAuth'
import User from '@/models/User'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/twoFactor'

// POST send OTP
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const twoFA = await TwoFactorAuth.findOne({ user: userId })
    
    if (!twoFA || !twoFA.enabled) {
      return NextResponse.json(
        { success: false, message: '2FA غير مفعل' },
        { status: 400 }
      )
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // توليد OTP
    const otp = generateOTP()
    
    // تخزين OTP (صالح لمدة 5 دقائق)
    storeOTP(userId, otp, 5)

    // إرسال OTP عبر البريد
    await sendOTPEmail(user.email, otp)

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
