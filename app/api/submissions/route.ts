import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET submissions
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
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    let query: any = {}

    if (decoded.role === 'student') {
      // الطالب يرى تسليماته فقط
      query.student = decoded.userId
      if (assignmentId) query.assignment = assignmentId
    } else if (decoded.role === 'instructor' || decoded.role === 'admin') {
      // المدرس يرى جميع التسليمات
      if (assignmentId) query.assignment = assignmentId
    }

    const submissions = await Submission.find(query)
      .populate('student', 'name email')
      .populate('assignment', 'title dueDate maxScore')
      .sort({ submittedAt: -1 })

    return NextResponse.json(
      {
        success: true,
        submissions,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get submissions error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST submit assignment
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { assignmentId, files, notes } = body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'الواجب غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الموعد النهائي
    if (new Date() > assignment.dueDate) {
      return NextResponse.json(
        { success: false, message: 'انتهى موعد التسليم' },
        { status: 400 }
      )
    }

    // التحقق من التسليم السابق
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: decoded.userId,
    })

    if (existingSubmission && !assignment.allowResubmission) {
      return NextResponse.json(
        { success: false, message: 'لا يمكن إعادة التسليم' },
        { status: 400 }
      )
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: decoded.userId,
      files,
      notes,
      status: existingSubmission ? 'resubmitted' : 'pending',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم تسليم الواجب بنجاح',
        submission,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Submit assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
