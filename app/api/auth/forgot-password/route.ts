import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    // In production, you would send an actual email here
    if (user) {
      // TODO: Generate reset token and send email
      // For now, just log it (in production, implement email sending)
      console.log(`Password reset requested for: ${email}`)
      
      // In a real implementation:
      // 1. Generate a secure reset token
      // 2. Save it to the user document with expiry
      // 3. Send email with reset link
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة بتعليمات إعادة التعيين',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
