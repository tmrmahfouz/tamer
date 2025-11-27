import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST approve enrollment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const enrollment = await Enrollment.findById(params.id)
    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'التسجيل غير موجود' },
        { status: 404 }
      )
    }

    // Update enrollment status
    enrollment.status = 'active'
    await enrollment.save()

    // Update course students count
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { studentsCount: 1 }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم الموافقة على التسجيل بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Approve enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
