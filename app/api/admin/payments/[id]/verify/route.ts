import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import CourseBundle from '@/models/CourseBundle'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST verify payment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

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
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const payment = await Payment.findById(id)
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'الدفعة غير موجودة' },
        { status: 404 }
      )
    }

    console.log('Payment found:', {
      id: payment._id,
      type: payment.type,
      bundle: payment.bundle,
      course: payment.course,
      user: payment.user
    })

    // Update payment status
    payment.status = 'verified'
    payment.verifiedAt = new Date()
    payment.verifiedBy = decoded.userId
    await payment.save()

    // Handle bundle payment
    console.log('Checking if bundle payment:', payment.type, payment.bundle)
    if (payment.type === 'bundle' && payment.bundle) {
      console.log('Processing bundle payment...')
      const bundle = await CourseBundle.findById(payment.bundle).populate('courses')
      console.log('Bundle found:', bundle ? bundle.name : 'NOT FOUND', 'Courses:', bundle?.courses?.length)
      if (bundle) {
        // Create enrollment for each course in the bundle
        for (const course of bundle.courses) {
          const existingEnrollment = await Enrollment.findOne({
            student: payment.user,
            course: course._id,
          })

          if (!existingEnrollment) {
            await Enrollment.create({
              student: payment.user,
              course: course._id,
              status: 'active',
              enrolledAt: new Date(),
              paymentStatus: 'completed',
              paymentMethod: payment.method,
              paymentAmount: 0, // Bundle price is shared
            })

            // Update course students count
            await Course.findByIdAndUpdate(course._id, {
              $inc: { students: 1 }
            })
          } else {
            existingEnrollment.status = 'active'
            existingEnrollment.paymentStatus = 'completed'
            await existingEnrollment.save()
          }
        }

        // Update bundle purchase count
        await CourseBundle.findByIdAndUpdate(payment.bundle, {
          $inc: { currentPurchases: 1 }
        })

        return NextResponse.json({
          success: true,
          message: `تم تأكيد الدفعة وتسجيل الطالب في ${bundle.courses.length} دورات بنجاح`,
        })
      }
    }

    // Handle regular course payment
    let enrollment
    if (payment.course) {
      if (payment.enrollment) {
        enrollment = await Enrollment.findByIdAndUpdate(
          payment.enrollment,
          { status: 'active', paymentStatus: 'completed' },
          { new: true }
        )
      } else {
        enrollment = await Enrollment.findOne({
          student: payment.user,
          course: payment.course,
        })

        if (enrollment) {
          enrollment.status = 'active'
          enrollment.paymentStatus = 'completed'
          await enrollment.save()
          payment.enrollment = enrollment._id
          await payment.save()
        } else {
          enrollment = await Enrollment.create({
            student: payment.user,
            course: payment.course,
            status: 'active',
            enrolledAt: new Date(),
            paymentStatus: 'completed',
            paymentMethod: payment.method,
            paymentAmount: payment.amount,
          })

          payment.enrollment = enrollment._id
          await payment.save()

          await Course.findByIdAndUpdate(payment.course, {
            $inc: { students: 1 }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد الدفعة وتسجيل الطالب في الدورة بنجاح',
      enrollment: enrollment ? { _id: enrollment._id, status: enrollment.status } : null
    })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ: ' + error.message },
      { status: 500 }
    )
  }
}
