import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'معرف الدورة مطلوب' },
        { status: 400 }
      )
    }

    let studentId = userId

    // If no userId provided, get from token
    if (!studentId) {
      const token = request.cookies.get('token')?.value
      if (token) {
        const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
        studentId = decoded.userId
      }
    }

    if (!studentId) {
      return NextResponse.json(
        {
          success: true,
          isEnrolled: false,
        },
        { status: 200 }
      )
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    })

    console.log('Enrollment check:', { studentId, courseId, found: !!enrollment, status: enrollment?.status })

    return NextResponse.json(
      {
        success: true,
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Check enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التحقق من التسجيل' },
      { status: 500 }
    )
  }
}
