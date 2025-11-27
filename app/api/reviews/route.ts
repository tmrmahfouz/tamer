import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET reviews for a course
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'معرف الدورة مطلوب' },
        { status: 400 }
      )
    }

    const reviews = await Review.find({ course: courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })

    // حساب متوسط التقييم
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    return NextResponse.json(
      {
        success: true,
        count: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        reviews,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب التقييمات' },
      { status: 500 }
    )
  }
}

// POST create review
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { courseId, rating, comment } = body

    // التحقق من البيانات
    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400 }
      )
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { success: false, message: 'التعليق يجب أن يكون 10 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // التحقق من وجود الدورة
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من عدم وجود تقييم سابق
    const existingReview = await Review.findOne({
      user: decoded.userId,
      course: courseId,
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'لقد قيّمت هذه الدورة بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء التقييم
    const review = await Review.create({
      user: decoded.userId,
      course: courseId,
      rating,
      comment,
    })

    // تحديث متوسط التقييم في الدورة
    const allReviews = await Review.find({ course: courseId })
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / allReviews.length

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(averageRating * 10) / 10,
      reviews: allReviews.length,
    })

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name avatar'
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة التقييم بنجاح',
        review: populatedReview,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة التقييم' },
      { status: 500 }
    )
  }
}
