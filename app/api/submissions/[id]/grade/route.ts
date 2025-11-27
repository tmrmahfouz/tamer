import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import { createNotification } from '@/lib/notifications'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST grade submission
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
    const { score, feedback } = body

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, message: 'الدرجة يجب أن تكون بين 0 و 100' },
        { status: 400 }
      )
    }

    const submission = await Submission.findByIdAndUpdate(
      params.id,
      {
        score,
        feedback,
        status: 'graded',
        gradedBy: decoded.userId,
        gradedAt: new Date(),
      },
      { new: true }
    ).populate('assignment', 'title')

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'التسليم غير موجود' },
        { status: 404 }
      )
    }

    // إرسال إشعار للطالب
    await createNotification({
      userId: submission.student.toString(),
      type: 'system',
      title: 'تم تقييم واجبك',
      message: `حصلت على ${score}/100 في واجب "${(submission.assignment as any).title}"`,
      link: `/assignments/${submission.assignment}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم تقييم الواجب',
        submission,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Grade submission error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
