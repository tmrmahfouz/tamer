import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TwoFactorAuth from '@/models/TwoFactorAuth'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { generateBackupCodes, encryptSecret } from '@/lib/twoFactor'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST setup 2FA
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

    // توليد Secret و Backup Codes
    const secret = Math.random().toString(36).substring(2, 15)
    const backupCodes = generateBackupCodes()

    // تشفير Secret
    const encryptedSecret = encryptSecret(secret)

    // حفظ أو تحديث 2FA
    let twoFA = await TwoFactorAuth.findOne({ user: decoded.userId })
    
    if (twoFA) {
      twoFA.secret = encryptedSecret
      twoFA.backupCodes = backupCodes
      twoFA.enabled = false // سيتم تفعيله بعد التحقق
      await twoFA.save()
    } else {
      twoFA = await TwoFactorAuth.create({
        user: decoded.userId,
        secret: encryptedSecret,
        backupCodes,
        enabled: false,
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إعداد 2FA بنجاح',
        backupCodes, // يجب على المستخدم حفظها
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Setup 2FA error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// GET check 2FA status
export async function GET(request: NextRequest) {
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

    return NextResponse.json(
      {
        success: true,
        enabled: twoFA?.enabled || false,
        hasBackupCodes: (twoFA?.backupCodes?.length || 0) > 0,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get 2FA status error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
