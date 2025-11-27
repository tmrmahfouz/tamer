import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    // Revenue stats
    const revenueData = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = revenueData[0]?.total || 0

    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()))
    
    const previousRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: previousPeriodStart, $lt: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const prevRevenue = previousRevenue[0]?.total || 0
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0

    // Students stats
    const totalStudents = await User.countDocuments({ role: 'student' })
    const newStudents = await User.countDocuments({ role: 'student', createdAt: { $gte: startDate } })
    const previousNewStudents = await User.countDocuments({ 
      role: 'student', 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    })
    const studentsGrowth = previousNewStudents > 0 ? ((newStudents - previousNewStudents) / previousNewStudents * 100).toFixed(1) : 0

    // Enrollments stats
    const totalEnrollments = await Enrollment.countDocuments({ createdAt: { $gte: startDate } })
    const previousEnrollments = await Enrollment.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    })
    const enrollmentsGrowth = previousEnrollments > 0 ? ((totalEnrollments - previousEnrollments) / previousEnrollments * 100).toFixed(1) : 0

    // Completion rate
    const completedEnrollments = await Enrollment.countDocuments({ 
      completionPercentage: 100,
      createdAt: { $gte: startDate }
    })
    const completionRate = totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) : 0

    // Revenue by month
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ])

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    const formattedRevenueByMonth = revenueByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue
    }))

    // Top courses
    const topCourses = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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

    // Payment methods
    const paymentMethods = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ])

    const formattedPaymentMethods = paymentMethods.map(pm => ({
      method: pm._id || 'غير محدد',
      count: pm.count,
      total: pm.total
    }))

    // Categories
    const categories = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    const formattedCategories = categories.map(cat => ({
      name: cat._id || 'غير مصنف',
      count: cat.count
    }))

    // Today's stats
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayStats = {
      newStudents: await User.countDocuments({ role: 'student', createdAt: { $gte: todayStart } }),
      newEnrollments: await Enrollment.countDocuments({ createdAt: { $gte: todayStart } }),
      revenue: (await Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]))[0]?.total || 0
    }

    // Trends
    const averageOrderValue = totalRevenue > 0 && totalEnrollments > 0 
      ? (totalRevenue / totalEnrollments).toFixed(0)
      : '0'

    const averageRating = (await Course.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]))[0]?.avg?.toFixed(1) || '0'

    const allStudents = await User.countDocuments({ role: 'student' })
    const conversionRate = allStudents > 0 
      ? ((totalEnrollments / allStudents) * 100).toFixed(1)
      : '0'

    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })

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
          enrollments: {
            total: totalEnrollments,
            growth: parseFloat(enrollmentsGrowth as string)
          },
          completionRate: parseFloat(completionRate as string),
          revenueByMonth: formattedRevenueByMonth,
          topCourses: topCoursesWithRevenue,
          paymentMethods: formattedPaymentMethods,
          categories: formattedCategories,
          todayStats,
          trends: {
            averageOrderValue,
            averageRating,
            conversionRate,
            activeUsers
          }
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Statistics error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
