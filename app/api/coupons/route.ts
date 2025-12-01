import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import User from '@/models/User'

// GET all coupons (Admin and Instructor)
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

    const user = await User.findById(decoded.userId)
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    // Admin sees all, instructor sees their own
    const query = user.role === 'admin' ? {} : { createdBy: decoded.userId }

    const coupons = await Coupon.find(query)
      .populate('courses', 'title')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, coupons })
  } catch (error: any) {
    console.error('Get coupons error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST create coupon (Admin and Instructor)
export async function POST(request: NextRequest) {
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
    const { code, discount, type, maxUses, expiresAt, courses } = body

    if (!code || !discount) {
      return NextResponse.json({ success: false, message: 'الكود والخصم مطلوبان' }, { status: 400 })
    }

    // Check if code exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json({ success: false, message: 'الكود موجود بالفعل' }, { status: 400 })
    }

    const couponData: any = {
      code: code.toUpperCase(),
      discountType: type || 'percentage',
      discountValue: discount,
      maxUses: maxUses || 0,
      courses: courses || [],
      isActive: true,
      usedCount: 0,
      createdBy: decoded.userId
    }
    
    if (expiresAt) {
      couponData.expiresAt = new Date(expiresAt)
    }

    const coupon = await Coupon.create(couponData)

    return NextResponse.json({ success: true, coupon, message: 'تم إنشاء الكوبون بنجاح' }, { status: 201 })
  } catch (error: any) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
