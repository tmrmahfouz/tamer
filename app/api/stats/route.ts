import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// GET - Get real statistics from database
export async function GET() {
  try {
    await connectDB()

    const User = (await import('@/models/User')).default
    const Course = (await import('@/models/Course')).default

    // Count students (users with role 'student')
    const studentsCount = await User.countDocuments({ role: 'student' })

    // Count published courses
    const coursesCount = await Course.countDocuments({ published: true })

    return NextResponse.json({
      success: true,
      stats: {
        students: studentsCount,
        courses: coursesCount,
      },
    })
  } catch (error: any) {
    console.error('Stats API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ',
      },
      { status: 500 }
    )
  }
}
