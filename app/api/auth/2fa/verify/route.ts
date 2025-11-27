import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TwoFactorAuth from '@/models/TwoFactorAuth'
import { getStoredOTP, deleteStoredOTP, verifyOTP } from '@/lib/twoFactor'

// POST verify 2FA code
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId, code, isBackupCode } = body

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, message: 'البيانات غير مكتملة' },
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

    let isValid = false

    if (isBackupCode) {
      // التحقق من Backup Code
      const codeIndex = twoFA.backupCodes.indexOf(code.toUpperCase())
      if (codeIndex !== -1) {
        // حذف الكود المستخدم
        twoFA.backupCodes.splice(codeIndex, 1)
        twoFA.lastUsed = new Date()
        await twoFA.save()
        isValid = true
      }
    } else {
      // التحقق من OTP
      const storedOTP = getStoredOTP(userId)
      if (storedOTP && verifyOTP(code, storedOTP)) {
        deleteStoredOTP(userId)
        twoFA.lastUsed = new Date()
        await twoFA.save()
        isValid = true
      }
    }

    if (isValid) {
      return NextResponse.json(
        {
          success: true,
          message: 'تم التحقق بنجاح',
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: 'الرمز غير صحيح أو منتهي الصلاحية' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Verify 2FA error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
