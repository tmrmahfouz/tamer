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
    const courses = await Course.find(
      user.role === 'admin' ? {} : { instructor: decoded.userId }
    ).select('_id').lean()
    const courseIds = courses.map((c: any) => c._id)

    // Get enrollments with user data
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email createdAt')
      .lean()

    // Group by user and count courses
    const studentsMap = new Map()
    enrollments.forEach((enrollment: any) => {
      if (enrollment.user) {
        const userId = enrollment.user._id.toString()
        if (studentsMap.has(userId)) {
          studentsMap.get(userId).coursesCount++
        } else {
          studentsMap.set(userId, {
            ...enrollment.user,
            coursesCount: 1,
            enrolledAt: enrollment.createdAt
          })
        }
      }
    })

    const students = Array.from(studentsMap.values())

    return NextResponse.json({ success: true, students })
  } catch (error: any) {
    console.error('Error fetching instructor students:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
