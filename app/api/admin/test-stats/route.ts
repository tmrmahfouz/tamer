import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Enrollment from '@/models/Enrollment'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    // Get enrollment count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.countDocuments({ student: student._id })
        const completedCourses = await Enrollment.countDocuments({
          student: student._id,
          completionPercentage: 100,
        })
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          lastLogin: student.lastLogin,
          enrollments,
          completedCourses,
        }
      })
    )

    // Calculate stats
    const total = students.length
    
    // Students registered this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newThisMonth = students.filter(
      (s) => new Date(s.createdAt) >= thisMonth
    ).length

    // Active students (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const active = students.filter(
      (s: any) => s.lastLogin && new Date(s.lastLogin) >= thirtyDaysAgo
    ).length

    return NextResponse.json(
      {
        success: true,
        debug: {
          totalStudents: students.length,
          studentsWithLastLogin: students.filter((s: any) => s.lastLogin).length,
          thirtyDaysAgo: thirtyDaysAgo.toISOString(),
          now: new Date().toISOString(),
        },
        students: studentsWithStats,
        stats: {
          total,
          active,
          newThisMonth,
        },
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )
  } catch (error: any) {
    console.error('Test stats error:', error)
    return NextResponse.json(
      { success: false, message: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
