import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET single assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    const decoded = token ? verifyToken(token) as any : null

    const assignment = await Assignment.findById(params.id)
      .populate('lesson', 'title')
      .populate('course', 'title')

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'الواجب غير موجود' },
        { status: 404 }
      )
    }

    // إذا كان الطالب، جلب تسليمه
    let submission = null
    if (decoded) {
      submission = await Submission.findOne({
        assignment: params.id,
        student: decoded.userId,
      }).sort({ submittedAt: -1 })
    }

    return NextResponse.json(
      {
        success: true,
        assignment,
        submission,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// PUT update assignment
export async function PUT(
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'instructor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const assignment = await Assignment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'الواجب غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الواجب',
        assignment,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE assignment
export async function DELETE(
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'instructor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const assignment = await Assignment.findByIdAndDelete(params.id)

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'الواجب غير موجود' },
        { status: 404 }
      )
    }

    // حذف جميع التسليمات
    await Submission.deleteMany({ assignment: params.id })

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الواجب',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
