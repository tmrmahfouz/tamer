import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST reject enrollment (admin only)
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
    enrollment.status = 'rejected'
    await enrollment.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم رفض التسجيل',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reject enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
