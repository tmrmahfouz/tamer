import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import Coupon from '@/models/Coupon'
import SupportTicket from '@/models/SupportTicket'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET create backup
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
    const collections = searchParams.get('collections')?.split(',') || [
      'users',
      'courses',
      'enrollments',
      'payments',
      'coupons',
      'tickets',
    ]

    const backup: any = {
      metadata: {
        createdAt: new Date(),
        version: '1.0',
        collections: collections,
      },
      data: {},
    }

    // Backup Users (without passwords)
    if (collections.includes('users')) {
      backup.data.users = await User.find().select('-password').lean()
    }

    // Backup Courses
    if (collections.includes('courses')) {
      backup.data.courses = await Course.find().lean()
    }

    // Backup Enrollments
    if (collections.includes('enrollments')) {
      backup.data.enrollments = await Enrollment.find().lean()
    }

    // Backup Payments
    if (collections.includes('payments')) {
      backup.data.payments = await Payment.find().lean()
    }

    // Backup Coupons
    if (collections.includes('coupons')) {
      backup.data.coupons = await Coupon.find().lean()
    }

    // Backup Support Tickets
    if (collections.includes('tickets')) {
      backup.data.tickets = await SupportTicket.find().lean()
    }

    // Calculate backup size
    const backupJSON = JSON.stringify(backup)
    const backupSize = Buffer.byteLength(backupJSON, 'utf8')

    return new NextResponse(backupJSON, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${Date.now()}.json"`,
        'Content-Length': backupSize.toString(),
      },
    })
  } catch (error: any) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST restore backup
export async function POST(request: NextRequest) {
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

    const backup = await request.json()

    if (!backup.metadata || !backup.data) {
      return NextResponse.json(
        { success: false, message: 'ملف النسخة الاحتياطية غير صالح' },
        { status: 400 }
      )
    }

    const results: any = {
      restored: [],
      failed: [],
    }

    // Restore Users
    if (backup.data.users) {
      try {
        // Note: This is a simple restore. In production, you'd want more sophisticated logic
        for (const userData of backup.data.users) {
          const existingUser = await User.findById(userData._id)
          if (!existingUser) {
            await User.create(userData)
            results.restored.push(`User: ${userData.email}`)
          }
        }
      } catch (error) {
        results.failed.push('Users collection')
      }
    }

    // Restore Courses
    if (backup.data.courses) {
      try {
        for (const courseData of backup.data.courses) {
          const existingCourse = await Course.findById(courseData._id)
          if (!existingCourse) {
            await Course.create(courseData)
            results.restored.push(`Course: ${courseData.title}`)
          }
        }
      } catch (error) {
        results.failed.push('Courses collection')
      }
    }

    // Restore Enrollments
    if (backup.data.enrollments) {
      try {
        for (const enrollmentData of backup.data.enrollments) {
          const existingEnrollment = await Enrollment.findById(enrollmentData._id)
          if (!existingEnrollment) {
            await Enrollment.create(enrollmentData)
            results.restored.push(`Enrollment: ${enrollmentData._id}`)
          }
        }
      } catch (error) {
        results.failed.push('Enrollments collection')
      }
    }

    // Restore Payments
    if (backup.data.payments) {
      try {
        for (const paymentData of backup.data.payments) {
          const existingPayment = await Payment.findById(paymentData._id)
          if (!existingPayment) {
            await Payment.create(paymentData)
            results.restored.push(`Payment: ${paymentData._id}`)
          }
        }
      } catch (error) {
        results.failed.push('Payments collection')
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم استعادة النسخة الاحتياطية بنجاح',
        results,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Restore error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
