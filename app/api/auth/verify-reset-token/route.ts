import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PasswordReset from '@/models/PasswordReset'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    await connectDB()

    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    return NextResponse.json({ valid: !!resetToken })
  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json({ valid: false })
  }
}
