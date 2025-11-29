import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import User from '@/models/User'

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
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    // Get instructor's courses
    const courses = await Course.find({ instructor: decoded.userId }).lean()
    const courseIds = courses.map((c: any) => c._id)

    // Get enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).lean()

    // Calculate stats
    const totalCourses = courses.length
    const totalStudents = new Set(enrollments.map((e: any) => e.user?.toString())).size
    const totalRevenue = enrollments.reduce((sum: number, e: any) => {
      const course = courses.find((c: any) => c._id.toString() === e.course?.toString())
      return sum + (course?.price || 0)
    }, 0)
    const averageRating = courses.length > 0
      ? courses.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / courses.length
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating
      }
    })
  } catch (error: any) {
    console.error('Error fetching instructor stats:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
