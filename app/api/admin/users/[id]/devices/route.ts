import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Get user's devices (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const user = await User.findById(id).select('name email devices maxDevices')
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        maxDevices: user.maxDevices
      },
      devices: user.devices || []
    })
  } catch (error: any) {
    console.error('Get user devices error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Update user's max devices or clear devices
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const { maxDevices, clearAllDevices } = body

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (clearAllDevices) {
      user.devices = []
    }

    if (maxDevices !== undefined) {
      user.maxDevices = maxDevices === 0 ? null : maxDevices
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: clearAllDevices ? 'تم مسح جميع الأجهزة' : 'تم تحديث الإعدادات',
      devices: user.devices,
      maxDevices: user.maxDevices
    })
  } catch (error: any) {
    console.error('Update user devices error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Remove specific device from user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({ success: false, message: 'معرف الجهاز مطلوب' }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    user.devices = user.devices?.filter((d: any) => d.deviceId !== deviceId) || []
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'تم إزالة الجهاز بنجاح',
      devices: user.devices
    })
  } catch (error: any) {
    console.error('Remove user device error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
