import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all coupons (Admin only)
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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // active, expired, all

    const query: any = {}
    
    if (search) {
      query.code = { $regex: search, $options: 'i' }
    }

    if (status === 'active') {
      query.isActive = true
      query.expiresAt = { $gt: new Date() }
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { expiresAt: { $lte: new Date() } }
      ]
    }

    const coupons = await Coupon.find(query)
      .populate('courses', 'title')
      .sort({ createdAt: -1 })
      .lean()

    // Calculate statistics
    const totalCoupons = await Coupon.countDocuments()
    const activeCoupons = await Coupon.countDocuments({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usedCount' } } }
    ])

    return NextResponse.json(
      {
        success: true,
        coupons,
        stats: {
          total: totalCoupons,
          active: activeCoupons,
          expired: totalCoupons - activeCoupons,
          totalUsage: totalUsage[0]?.total || 0
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get coupons error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST create coupon (Admin only)
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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, discountType, discountValue, maxUses, expiresAt, courses } = body

    // Validation
    if (!code || !discountType || !discountValue || !expiresAt) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'كود الكوبون موجود بالفعل' },
        { status: 400 }
      )
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, message: 'نسبة الخصم يجب أن تكون بين 0 و 100' },
        { status: 400 }
      )
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: maxUses || 0,
      expiresAt: new Date(expiresAt),
      courses: courses || [],
      isActive: true,
      usedCount: 0
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الكوبون بنجاح',
        coupon
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
