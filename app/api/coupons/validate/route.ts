import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { code, courseId } = body

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'كود الكوبون مطلوب' },
        { status: 400 }
      )
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'كود الكوبون غير صحيح' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحية
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'هذا الكوبون غير نشط' },
        { status: 400 }
      )
    }

    if (new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'انتهت صلاحية هذا الكوبون' },
        { status: 400 }
      )
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, message: 'تم استخدام هذا الكوبون بالكامل' },
        { status: 400 }
      )
    }

    // التحقق من الدورات المحددة
    if (courseId && coupon.courses.length > 0) {
      const courseAllowed = coupon.courses.some(
        (id) => id.toString() === courseId
      )
      if (!courseAllowed) {
        return NextResponse.json(
          { success: false, message: 'هذا الكوبون غير صالح لهذه الدورة' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'الكوبون صالح',
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Validate coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التحقق من الكوبون' },
      { status: 500 }
    )
  }
}
