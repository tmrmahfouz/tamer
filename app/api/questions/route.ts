import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET questions
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')
    const sort = searchParams.get('sort') || 'recent' // recent, popular, unsolved

    const query: any = {}
    if (courseId) query.course = courseId
    if (lessonId) query.lesson = lessonId

    let sortQuery: any = { createdAt: -1 }
    if (sort === 'popular') {
      sortQuery = { upvotes: -1, createdAt: -1 }
    } else if (sort === 'unsolved') {
      query.solved = false
      sortQuery = { createdAt: -1 }
    }

    const questions = await Question.find(query)
      .populate('user', 'name avatar')
      .populate('lesson', 'title')
      .sort(sortQuery)
      .limit(50)

    return NextResponse.json(
      {
        success: true,
        questions,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الأسئلة' },
      { status: 500 }
    )
  }
}

// POST create question
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
    const { courseId, lessonId, title, content } = body

    if (!title || title.length < 10) {
      return NextResponse.json(
        { success: false, message: 'العنوان يجب أن يكون 10 أحرف على الأقل' },
        { status: 400 }
      )
    }

    if (!content || content.length < 20) {
      return NextResponse.json(
        { success: false, message: 'المحتوى يجب أن يكون 20 حرف على الأقل' },
        { status: 400 }
      )
    }

    const question = await Question.create({
      user: decoded.userId,
      course: courseId,
      lesson: lessonId,
      title,
      content,
    })

    const populatedQuestion = await Question.findById(question._id)
      .populate('user', 'name avatar')
      .populate('lesson', 'title')

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة السؤال بنجاح',
        question: populatedQuestion,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة السؤال' },
      { status: 500 }
    )
  }
}
