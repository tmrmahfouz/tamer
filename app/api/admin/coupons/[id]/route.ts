import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// PUT update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { discountType, discountValue, maxUses, expiresAt, courses, isActive } = body

    const coupon = await Coupon.findByIdAndUpdate(
      params.id,
      {
        discountType,
        discountValue,
        maxUses,
        expiresAt: new Date(expiresAt),
        courses,
        isActive
      },
      { new: true }
    )

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'الكوبون غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الكوبون بنجاح',
        coupon
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
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

    const coupon = await Coupon.findByIdAndDelete(params.id)

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'الكوبون غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الكوبون بنجاح'
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
