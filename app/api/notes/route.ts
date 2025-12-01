import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Note from '@/models/Note'

// GET notes for a lesson
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')

    let query: any = { user: decoded.userId }

    if (lessonId) {
      query.lesson = lessonId
    }

    if (courseId) {
      query.course = courseId
    }

    const notes = await Note.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, notes }, { status: 200 })
  } catch (error: any) {
    console.error('Get notes error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST create new note
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, lessonId, content, timestamp, attachments, isSharedWithInstructor, status } = body

    if (!courseId || !lessonId || !content) {
      return NextResponse.json({ success: false, message: 'البيانات غير مكتملة' }, { status: 400 })
    }

    const note = await Note.create({
      user: decoded.userId,
      course: courseId,
      lesson: lessonId,
      content,
      timestamp,
      attachments: attachments || [],
      isSharedWithInstructor: isSharedWithInstructor || false,
      status: status || 'private',
    })

    return NextResponse.json({ success: true, note }, { status: 201 })
  } catch (error: any) {
    console.error('Create note error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
