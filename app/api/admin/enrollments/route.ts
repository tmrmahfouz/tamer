import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET all enrollments (admin only)
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
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const enrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort({ enrolledAt: -1 })
      .lean()

    return NextResponse.json(
      {
        success: true,
        enrollments,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
