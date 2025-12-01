import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Note from '@/models/Note'
import Course from '@/models/Course'

// GET shared notes for admin/instructor
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'instructor')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') // shared, replied, all

    let query: any = { isSharedWithInstructor: true }

    // للمدرب: فقط ملاحظات دوراته
    if (decoded.role === 'instructor') {
      const instructorCourses = await Course.find({ instructor: decoded.userId }).select('_id')
      const courseIds = instructorCourses.map(c => c._id)
      query.course = { $in: courseIds }
    }

    if (courseId) {
      query.course = courseId
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const notes = await Note.find(query)
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, notes }, { status: 200 })
  } catch (error: any) {
    console.error('Get admin notes error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
