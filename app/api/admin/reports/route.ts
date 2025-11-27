import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET generate report
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json' // json, csv, excel

    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    }

    let reportData: any = {}

    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(dateFilter)
        break
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter)
        break
      case 'students':
        reportData = await generateStudentsReport(dateFilter)
        break
      case 'courses':
        reportData = await generateCoursesReport(dateFilter)
        break
      case 'enrollments':
        reportData = await generateEnrollmentsReport(dateFilter)
        break
      default:
        reportData = await generateOverviewReport(dateFilter)
    }

    // Format response based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(reportData)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${reportType}-${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json(
      {
        success: true,
        reportType,
        dateRange: { startDate, endDate },
        data: reportData,
        generatedAt: new Date()
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

async function generateOverviewReport(dateFilter: any) {
  const totalUsers = await User.countDocuments(dateFilter)
  const totalStudents = await User.countDocuments({ ...dateFilter, role: 'student' })
  const totalInstructors = await User.countDocuments({ ...dateFilter, role: 'instructor' })
  const totalCourses = await Course.countDocuments(dateFilter)
  const totalEnrollments = await Enrollment.countDocuments(dateFilter)
  
  const revenueData = await Payment.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
  const totalRevenue = revenueData[0]?.total || 0

  const avgCoursePrice = await Course.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, avg: { $avg: '$price' } } }
  ])

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      instructors: totalInstructors
    },
    courses: {
      total: totalCourses,
      averagePrice: avgCoursePrice[0]?.avg || 0
    },
    enrollments: totalEnrollments,
    revenue: {
      total: totalRevenue,
      average: totalEnrollments > 0 ? totalRevenue / totalEnrollments : 0
    }
  }
}

async function generateRevenueReport(dateFilter: any) {
  const payments = await Payment.find({ ...dateFilter, status: 'completed' })
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .lean()

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  
  const revenueByMonth = await Payment.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ])

  const revenueByMethod = await Payment.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ])

  return {
    totalRevenue,
    totalTransactions: payments.length,
    averageTransaction: payments.length > 0 ? totalRevenue / payments.length : 0,
    byMonth: revenueByMonth,
    byMethod: revenueByMethod,
    recentPayments: payments.slice(0, 20)
  }
}

async function generateStudentsReport(dateFilter: any) {
  const students = await User.find({ ...dateFilter, role: 'student' })
    .select('-password')
    .lean()

  const studentsWithEnrollments = await Promise.all(
    students.map(async (student) => {
      const enrollments = await Enrollment.countDocuments({ user: student._id })
      const completedCourses = await Enrollment.countDocuments({
        user: student._id,
        completionPercentage: 100
      })
      return {
        ...student,
        enrollments,
        completedCourses
      }
    })
  )

  const topStudents = studentsWithEnrollments
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 10)

  return {
    totalStudents: students.length,
    students: studentsWithEnrollments,
    topStudents
  }
}

async function generateCoursesReport(dateFilter: any) {
  const courses = await Course.find(dateFilter)
    .populate('instructor', 'name')
    .lean()

  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const enrollments = await Enrollment.countDocuments({ course: course._id })
      const revenue = await Payment.aggregate([
        { $match: { course: course._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      return {
        ...course,
        enrollments,
        revenue: revenue[0]?.total || 0
      }
    })
  )

  const topCourses = coursesWithStats
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 10)

  return {
    totalCourses: courses.length,
    courses: coursesWithStats,
    topCourses
  }
}

async function generateEnrollmentsReport(dateFilter: any) {
  const enrollments = await Enrollment.find(dateFilter)
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort({ enrolledAt: -1 })
    .lean()

  const byStatus = await Enrollment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])

  const completionRate = await Enrollment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ])

  return {
    totalEnrollments: enrollments.length,
    byStatus,
    averageCompletion: completionRate[0]?.avgCompletion || 0,
    enrollments: enrollments.slice(0, 100)
  }
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - can be enhanced
  const headers = Object.keys(data).join(',')
  const values = Object.values(data).map(v => 
    typeof v === 'object' ? JSON.stringify(v) : v
  ).join(',')
  
  return `${headers}\n${values}`
}
