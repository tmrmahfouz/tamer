import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import PasswordReset from '@/models/PasswordReset'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

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
    if (user) {
      // Delete any existing reset tokens for this user
      await PasswordReset.deleteMany({ userId: user._id })

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Save token with 1 hour expiry
      await PasswordReset.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      })

      // Build reset URL
      const baseUrl = process.env.NEXTAUTH_URL || req.headers.get('origin') || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${token}`

      // Send email
      const emailSent = await sendPasswordResetEmail(email, resetUrl)
      
      if (!emailSent) {
        console.log('Email service not configured. Reset URL:', resetUrl)
      }
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
