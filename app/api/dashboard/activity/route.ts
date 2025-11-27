import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import Course from '@/models/Course'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET recent activity
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

    const activities: any[] = []

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate('student', 'name')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .limit(5)
      .lean()

    recentEnrollments.forEach((enrollment: any) => {
      const timeAgo = getTimeAgo(new Date(enrollment.enrolledAt))
      activities.push({
        type: 'enrollment',
        title: 'تسجيل جديد',
        description: `${enrollment.student?.name} سجل في دورة ${enrollment.course?.title}`,
        time: timeAgo,
        timestamp: new Date(enrollment.enrolledAt).getTime()
      })
    })

    // Get recent payments (admin only)
    if (decoded.role === 'admin') {
      const recentPayments = await Payment.find()
        .populate('user', 'name')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

      recentPayments.forEach((payment: any) => {
        const timeAgo = getTimeAgo(new Date(payment.createdAt))
        activities.push({
          type: 'payment',
          title: 'دفعة جديدة',
          description: `${payment.user?.name} دفع ${payment.amount} جنيه لدورة ${payment.course?.title}`,
          time: timeAgo,
          timestamp: new Date(payment.createdAt).getTime()
        })
      })
    }

    // Get recent courses
    const recentCourses = await Course.find({ isPublished: true })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()

    recentCourses.forEach((course: any) => {
      const timeAgo = getTimeAgo(new Date(course.createdAt))
      activities.push({
        type: 'course',
        title: 'دورة جديدة',
        description: `تم نشر دورة ${course.title} بواسطة ${course.instructor?.name}`,
        time: timeAgo,
        timestamp: new Date(course.createdAt).getTime()
      })
    })

    // Get recent completions
    const completedEnrollments = await Enrollment.find({
      completionPercentage: 100,
      certificateIssued: true
    })
      .populate('student', 'name')
      .populate('course', 'title')
      .sort({ certificateIssuedAt: -1 })
      .limit(3)
      .lean()

    completedEnrollments.forEach((enrollment: any) => {
      if (enrollment.certificateIssuedAt) {
        const timeAgo = getTimeAgo(new Date(enrollment.certificateIssuedAt))
        activities.push({
          type: 'completion',
          title: 'إكمال دورة',
          description: `${enrollment.student?.name} أكمل دورة ${enrollment.course?.title}`,
          time: timeAgo,
          timestamp: new Date(enrollment.certificateIssuedAt).getTime()
        })
      }
    })

    // Sort by timestamp and limit to 10
    activities.sort((a, b) => b.timestamp - a.timestamp)
    const limitedActivities = activities.slice(0, 10)

    return NextResponse.json(
      {
        success: true,
        activities: limitedActivities,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 7) return `منذ ${days} يوم`
  
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
