import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET analytics (admin only)
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
        { success: false, message: 'غير مصرح' },
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
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    // Revenue stats
    const payments = await Payment.find({
      status: { $in: ['completed', 'verified'] },
      createdAt: { $gte: startDate }
    })
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    
    // Previous period for growth calculation
    const prevStartDate = new Date(startDate)
    prevStartDate.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()))
    
    const prevPayments = await Payment.find({
      status: { $in: ['completed', 'verified'] },
      createdAt: { $gte: prevStartDate, $lt: startDate }
    })
    
    const prevRevenue = prevPayments.reduce((sum, p) => sum + p.amount, 0)
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0

    // Students stats
    const newStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: startDate }
    })
    
    const totalStudents = await User.countDocuments({ role: 'student' })

    // Enrollments stats
    const newEnrollments = await Enrollment.countDocuments({
      enrolledAt: { $gte: startDate }
    })
    
    const totalEnrollments = await Enrollment.countDocuments()

    // Courses stats
    const activeCourses = await Course.countDocuments({
      isPublished: true
    })
    
    const totalCourses = await Course.countDocuments()

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'verified'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    const revenueByMethodFormatted = revenueByMethod.map(method => ({
      name: method._id === 'card' ? 'بطاقة ائتمان' : method._id === 'bank' ? 'تحويل بنكي' : 'نقدي',
      amount: method.amount,
      count: method.count,
      percentage: ((method.amount / totalRevenue) * 100).toFixed(1)
    }))

    // Top courses
    const topCourses = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$course',
          enrollments: { $sum: 1 }
        }
      },
      {
        $sort: { enrollments: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      }
    ])

    const topCoursesFormatted = await Promise.all(
      topCourses.map(async (course) => {
        const coursePayments = await Payment.find({
          course: course._id,
          status: { $in: ['completed', 'verified'] },
          createdAt: { $gte: startDate }
        })
        
        const revenue = coursePayments.reduce((sum, p) => sum + p.amount, 0)
        
        return {
          title: course.courseData.title,
          enrollments: course.enrollments,
          revenue
        }
      })
    )

    // Additional metrics
    const completedEnrollments = await Enrollment.countDocuments({
      completionPercentage: 100
    })
    
    const completionRate = totalEnrollments > 0 
      ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
      : 0

    const averageCoursePrice = payments.length > 0
      ? (totalRevenue / payments.length).toFixed(0)
      : 0

    const analytics = {
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth
      },
      students: {
        new: newStudents,
        total: totalStudents
      },
      enrollments: {
        new: newEnrollments,
        total: totalEnrollments
      },
      courses: {
        active: activeCourses,
        total: totalCourses
      },
      revenueByMethod: revenueByMethodFormatted,
      topCourses: topCoursesFormatted,
      completionRate,
      averageCoursePrice,
      conversionRate: 0, // Would need visitor tracking
    }

    return NextResponse.json(
      {
        success: true,
        analytics,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
