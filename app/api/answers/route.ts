import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Answer from '@/models/Answer'
import Question from '@/models/Question'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST create answer
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
    const body = await request.json()
    const { questionId, content } = body

    if (!content || content.length < 10) {
      return NextResponse.json(
        { success: false, message: 'الإجابة يجب أن تكون 10 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const question = await Question.findById(questionId)
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    const answer = await Answer.create({
      user: decoded.userId,
      question: questionId,
      content,
    })

    // إضافة الإجابة للسؤال
    question.answers.push(answer._id as any)
    await question.save()

    const populatedAnswer = await Answer.findById(answer._id).populate(
      'user',
      'name avatar'
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الإجابة بنجاح',
        answer: populatedAnswer,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create answer error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الإجابة' },
      { status: 500 }
    )
  }
}
