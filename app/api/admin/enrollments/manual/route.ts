import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import Course from '@/models/Course'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST manual enrollment
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

    const body = await request.json()
    const { studentId, courseId, paymentAmount, paymentMethod, notes } = body

    console.log('Manual enrollment request:', { studentId, courseId, paymentAmount, paymentMethod, notes })

    // Validate inputs
    if (!studentId || !courseId || paymentAmount === undefined) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'الطالب مسجل بالفعل في هذه الدورة' },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await Payment.create({
      user: studentId,
      course: courseId,
      amount: paymentAmount,
      currency: 'EGP',
      method: paymentMethod,
      status: 'completed',
      paymentMethod: paymentMethod,
      transactionId: `MANUAL-${Date.now()}`,
      paymentDetails: {
        addedBy: decoded.userId,
        notes: notes || 'تسجيل يدوي بواسطة Admin',
        manualEntry: true,
      },
    })

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      paymentStatus: 'completed',
      paymentAmount: paymentAmount,
      paymentMethod: paymentMethod,
      progress: [],
      completionPercentage: 0,
    })

    // Update course students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { students: 1 },
    })

    // Populate data for response
    await enrollment.populate('student', 'name email')
    await enrollment.populate('course', 'title')

    return NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الطالب في الدورة بنجاح',
        enrollment,
        payment,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Manual enrollment error:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    )
  }
}
