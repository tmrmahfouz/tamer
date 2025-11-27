import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Note from '@/models/Note'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET notes
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
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    const query: any = { user: decoded.userId }
    if (courseId) query.course = courseId
    if (lessonId) query.lesson = lessonId

    const notes = await Note.find(query)
      .populate('lesson', 'title')
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        notes,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الملاحظات' },
      { status: 500 }
    )
  }
}

// POST create note
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
    const { courseId, lessonId, content, timestamp } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'المحتوى مطلوب' },
        { status: 400 }
      )
    }

    const note = await Note.create({
      user: decoded.userId,
      course: courseId,
      lesson: lessonId,
      content: content.trim(),
      timestamp,
    })

    const populatedNote = await Note.findById(note._id).populate('lesson', 'title')

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الملاحظة',
        note: populatedNote,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الملاحظة' },
      { status: 500 }
    )
  }
}
