import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CourseBundle from '@/models/CourseBundle'
import Course from '@/models/Course'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - جلب جميع الحزم
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const bundles = await CourseBundle.find()
      .populate('courses', 'title price thumbnail')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({ success: true, bundles })
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزم' },
      { status: 500 }
    )
  }
}

// POST - إنشاء حزمة جديدة
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }
    
    const data = await request.json()
    console.log('Received bundle data:', data)
    
    // حساب السعر الأصلي من مجموع أسعار الدورات
    let originalPrice = 0
    if (data.courses && data.courses.length > 0) {
      const courses = await Course.find({ _id: { $in: data.courses } })
      originalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0)
    }
    
    // حساب السعر النهائي
    const discountPercentage = data.discountPercentage || 0
    const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100))
    
    // تنظيف البيانات
    const bundleData: any = {
      name: data.name,
      description: data.description || '',
      image: data.image || '',
      courses: data.courses || [],
      originalPrice,
      discountPercentage,
      finalPrice,
      isActive: data.isActive !== false,
    }
    
    // إضافة التواريخ فقط إذا كانت موجودة
    if (data.validFrom) {
      bundleData.validFrom = new Date(data.validFrom)
    }
    if (data.validUntil) {
      bundleData.validUntil = new Date(data.validUntil)
    }
    if (data.maxPurchases) {
      bundleData.maxPurchases = data.maxPurchases
    }
    
    const bundle = new CourseBundle(bundleData)
    await bundle.save()
    
    const populatedBundle = await CourseBundle.findById(bundle._id)
      .populate('courses', 'title price thumbnail')
    
    console.log('Bundle created:', populatedBundle)
    return NextResponse.json({ success: true, bundle: populatedBundle })
  } catch (error: any) {
    console.error('Error creating bundle:', error.message, error.stack)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الحزمة: ' + error.message },
      { status: 500 }
    )
  }
}
