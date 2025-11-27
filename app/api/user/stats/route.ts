import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET user stats
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Get enrollments count
    const enrolledCourses = await Enrollment.countDocuments({
      student: decoded.userId,
    })

    // Get completed courses
    const completedCourses = await Enrollment.countDocuments({
      student: decoded.userId,
      completionPercentage: 100,
    })

    // Get certificates
    const certificates = await Enrollment.countDocuments({
      student: decoded.userId,
      certificateIssued: true,
    })

    // Calculate total hours (estimate based on courses)
    const enrollments = await Enrollment.find({
      student: decoded.userId,
    }).populate('course', 'duration')

    const totalHours = enrollments.reduce((sum, enrollment: any) => {
      return sum + (enrollment.course?.duration || 0)
    }, 0)

    return NextResponse.json(
      {
        success: true,
        stats: {
          enrolledCourses,
          completedCourses,
          certificates,
          totalHours: Math.round(totalHours),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
