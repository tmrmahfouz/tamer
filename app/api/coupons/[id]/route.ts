import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import User from '@/models/User'

// GET single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const coupon = await Coupon.findById(params.id).populate('courses', 'title')
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'الكوبون غير موجود' }, { status: 404 })
    }
    return NextResponse.json({ success: true, coupon })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(decoded.userId)
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true })

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'الكوبون غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, coupon, message: 'تم تحديث الكوبون' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(decoded.userId)
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const coupon = await Coupon.findByIdAndDelete(params.id)
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'الكوبون غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف الكوبون' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
