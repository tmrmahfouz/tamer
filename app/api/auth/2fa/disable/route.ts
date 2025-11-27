import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TwoFactorAuth from '@/models/TwoFactorAuth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST disable 2FA
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
    const { password } = body

    // التحقق من كلمة المرور (يجب إضافة هذا للأمان)
    // const user = await User.findById(decoded.userId)
    // const isValidPassword = await bcrypt.compare(password, user.password)
    // if (!isValidPassword) {
    //   return NextResponse.json({ success: false, message: 'كلمة مرور خاطئة' }, { status: 401 })
    // }

    const twoFA = await TwoFactorAuth.findOne({ user: decoded.userId })
    
    if (!twoFA) {
      return NextResponse.json(
        { success: false, message: '2FA غير مفعل' },
        { status: 400 }
      )
    }

    twoFA.enabled = false
    await twoFA.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم تعطيل 2FA بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Disable 2FA error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
