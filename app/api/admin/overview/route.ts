import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import SupportTicket from '@/models/SupportTicket'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(now.getMonth() - 1)
    const previousMonth = new Date()
    previousMonth.setMonth(now.getMonth() - 2)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Revenue stats — all-time total, monthly growth
    const allTimeRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = allTimeRevenue[0]?.total || 0

    const currentMonthRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const curRevenue = currentMonthRevenue[0]?.total || 0

    const previousRevenueData = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: previousMonth, $lt: lastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const prevRevenue = previousRevenueData[0]?.total || 0
    const revenueGrowth = prevRevenue > 0 ? ((curRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0

    // Students stats — all-time total, monthly growth
    const totalStudents = await User.countDocuments({ role: 'student' })
    const currentMonthStudents = await User.countDocuments({ role: 'student', createdAt: { $gte: lastMonth } })
    const previousStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: previousMonth, $lt: lastMonth }
    })
    const studentsGrowth = previousStudents > 0 ? ((currentMonthStudents - previousStudents) / previousStudents * 100).toFixed(1) : 0

    // Courses stats — all-time total, monthly growth
    const totalCourses = await Course.countDocuments()
    const currentMonthCourses = await Course.countDocuments({ createdAt: { $gte: lastMonth } })
    const previousCourses = await Course.countDocuments({
      createdAt: { $gte: previousMonth, $lt: lastMonth }
    })
    const coursesGrowth = previousCourses > 0 ? ((currentMonthCourses - previousCourses) / previousCourses * 100).toFixed(1) : 0

    // Enrollments stats — all-time total, monthly growth
    const totalEnrollments = await Enrollment.countDocuments()
    const currentMonthEnrollments = await Enrollment.countDocuments({ createdAt: { $gte: lastMonth } })
    const previousEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: previousMonth, $lt: lastMonth }
    })
    const enrollmentsGrowth = previousEnrollments > 0 ? ((currentMonthEnrollments - previousEnrollments) / previousEnrollments * 100).toFixed(1) : 0

    // Today's stats
    const todayStats = {
      newStudents: await User.countDocuments({ role: 'student', createdAt: { $gte: todayStart } }),
      newEnrollments: await Enrollment.countDocuments({ createdAt: { $gte: todayStart } }),
    }

    // Pending items
    const pendingStats = {
      payments: await Payment.countDocuments({ status: 'pending' }),
      tickets: await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    }

    // Revenue chart (last 6 months)
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    const revenueChart = []

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(now.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const monthRevenue = await Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])

      revenueChart.push({
        month: monthNames[monthStart.getMonth()],
        value: monthRevenue[0]?.total || 0
      })
    }

    // Top courses
    const topCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: '$course',
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' }
    ])

    const topCoursesWithRevenue = await Promise.all(
      topCourses.map(async (course) => {
        const revenue = await Payment.aggregate([
          { $match: { course: course._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        return {
          title: course.courseData.title,
          enrollments: course.enrollments,
          revenue: revenue[0]?.total || 0
        }
      })
    )

    // Online users (mock data - would need real-time tracking)
    const onlineUsers = 0

    // Live sessions (mock data - would need real implementation)
    const liveSessions = 0

    return NextResponse.json(
      {
        success: true,
        stats: {
          revenue: {
            total: totalRevenue,
            growth: parseFloat(revenueGrowth as string)
          },
          students: {
            total: totalStudents,
            growth: parseFloat(studentsGrowth as string)
          },
          courses: {
            total: totalCourses,
            growth: parseFloat(coursesGrowth as string)
          },
          enrollments: {
            total: totalEnrollments,
            growth: parseFloat(enrollmentsGrowth as string)
          },
          today: todayStats,
          pending: pendingStats,
          revenueChart,
          topCourses: topCoursesWithRevenue,
          online: {
            users: onlineUsers
          },
          live: {
            sessions: liveSessions
          }
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Admin overview error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
