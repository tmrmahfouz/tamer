import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Answer from '@/models/Answer'
import Question from '@/models/Question'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// PATCH accept answer
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

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const answer = await Answer.findById(params.id)
    if (!answer) {
      return NextResponse.json(
        { success: false, message: 'الإجابة غير موجودة' },
        { status: 404 }
      )
    }

    const question = await Question.findById(answer.question)
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    // فقط صاحب السؤال يمكنه قبول الإجابة
    if (question.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // إلغاء قبول جميع الإجابات الأخرى
    await Answer.updateMany(
      { question: answer.question },
      { isAccepted: false }
    )

    // قبول هذه الإجابة
    answer.isAccepted = true
    await answer.save()

    // وضع علامة محلول على السؤال
    question.solved = true
    await question.save()

    return NextResponse.json(
      {
        success: true,
        answer,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Accept answer error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE answer
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

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const answer = await Answer.findById(params.id)
    if (!answer) {
      return NextResponse.json(
        { success: false, message: 'الإجابة غير موجودة' },
        { status: 404 }
      )
    }

    // فقط صاحب الإجابة أو الأدمن
    if (answer.user.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // إزالة من السؤال
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
    })

    await answer.deleteOne()

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الإجابة',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete answer error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
