import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Note from '@/models/Note'
import Course from '@/models/Course'

// GET single note
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const note = await Note.findById(params.id)
      .populate('user', 'name email avatar')
      .populate('course', 'title instructor')
      .populate('lesson', 'title')

    if (!note) {
      return NextResponse.json({ success: false, message: 'الملاحظة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, note }, { status: 200 })
  } catch (error: any) {
    console.error('Get note error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Reply to note (instructor/admin)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'instructor')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    const note = await Note.findById(params.id).populate('course', 'instructor')
    if (!note) {
      return NextResponse.json({ success: false, message: 'الملاحظة غير موجودة' }, { status: 404 })
    }

    // التحقق من صلاحية المدرب
    if (decoded.role === 'instructor') {
      const courseInstructor = (note.course as any).instructor?.toString()
      if (courseInstructor !== decoded.userId) {
        return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { instructorReply } = body

    note.instructorReply = instructorReply
    note.instructorRepliedAt = new Date()
    note.status = 'replied'
    await note.save()

    const updatedNote = await Note.findById(params.id)
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .populate('lesson', 'title')

    return NextResponse.json({ success: true, message: 'تم إرسال الرد', note: updatedNote }, { status: 200 })
  } catch (error: any) {
    console.error('Reply to note error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
