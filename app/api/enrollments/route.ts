import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST - Enroll in a course
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
    const body = await request.json()
    const { courseId, paymentId } = body

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: decoded.userId,
      course: courseId,
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'أنت مسجل بالفعل في هذه الدورة' },
        { status: 400 }
      )
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    const enrollment = await Enrollment.create({
      student: decoded.userId,
      course: courseId,
      paymentAmount: course.price,
      paymentStatus: 'completed',
    })

    // Update course students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { students: 1 },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم التسجيل في الدورة بنجاح',
        enrollment,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}

// GET - Get my enrollments
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

    const enrollments = await Enrollment.find({ 
      student: decoded.userId,
      status: { $in: ['active', 'completed'] }
    })
      .populate('course', 'title description image price duration lessons thumbnail')
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        count: enrollments.length,
        enrollments,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدورات' },
      { status: 500 }
    )
  }
}
