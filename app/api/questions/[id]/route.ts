import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import Answer from '@/models/Answer'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET single question with answers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const question = await Question.findById(params.id)
      .populate('user', 'name avatar')
      .populate('lesson', 'title')

    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    const answers = await Answer.find({ question: params.id })
      .populate('user', 'name avatar')
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })

    return NextResponse.json(
      {
        success: true,
        question,
        answers,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get question error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// PATCH mark as solved
export async function PATCH(
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

    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    // فقط صاحب السؤال يمكنه وضع علامة محلول
    if (question.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    question.solved = !question.solved
    await question.save()

    return NextResponse.json(
      {
        success: true,
        question,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update question error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE question
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

    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    // فقط صاحب السؤال أو الأدمن
    if (question.user.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // حذف جميع الإجابات
    await Answer.deleteMany({ question: params.id })
    await question.deleteOne()

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف السؤال',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
