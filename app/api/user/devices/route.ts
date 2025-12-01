import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Get user's devices
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const user = await User.findById(decoded.userId).select('devices maxDevices')
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      devices: user.devices || [],
      maxDevices: user.maxDevices
    })
  } catch (error: any) {
    console.error('Get devices error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Disabled for students (only admin can remove devices)
export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'غير مسموح بحذف الأجهزة. تواصل مع الدعم الفني.' },
    { status: 403 }
  )
}
