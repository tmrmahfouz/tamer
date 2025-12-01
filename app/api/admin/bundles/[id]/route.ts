import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CourseBundle from '@/models/CourseBundle'
import Course from '@/models/Course'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - جلب حزمة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const bundle = await CourseBundle.findById(id)
      .populate('courses', 'title price thumbnail description')
    
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'الحزمة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, bundle })
  } catch (error) {
    console.error('Error fetching bundle:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزمة' },
      { status: 500 }
    )
  }
}

// PUT - تحديث حزمة
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }
    
    const data = await request.json()
    
    // حساب السعر الأصلي من مجموع أسعار الدورات
    let originalPrice = data.originalPrice || 0
    if (data.courses && data.courses.length > 0) {
      const courses = await Course.find({ _id: { $in: data.courses } })
      originalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0)
    }
    
    // حساب السعر النهائي
    const discountPercentage = data.discountPercentage || 0
    const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100))
    
    const bundle = await CourseBundle.findByIdAndUpdate(
      id,
      { ...data, originalPrice, finalPrice },
      { new: true }
    ).populate('courses', 'title price thumbnail')
    
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'الحزمة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, bundle })
  } catch (error) {
    console.error('Error updating bundle:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الحزمة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف حزمة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }
    
    const bundle = await CourseBundle.findByIdAndDelete(id)
    
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'الحزمة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'تم حذف الحزمة بنجاح' })
  } catch (error) {
    console.error('Error deleting bundle:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الحزمة' },
      { status: 500 }
    )
  }
}
