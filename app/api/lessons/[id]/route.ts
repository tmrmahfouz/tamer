import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

// GET single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const lesson = await Lesson.findById(params.id).populate('course', 'title instructor')

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'الدرس غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        lesson,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get lesson error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدرس' },
      { status: 500 }
    )
  }
}

// PUT update lesson
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

    const lesson = await Lesson.findById(params.id).populate('course')

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'الدرس غير موجود' },
        { status: 404 }
      )
    }

    const course = lesson.course as any
    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بتعديل هذا الدرس' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updatedLesson = await Lesson.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الدرس بنجاح',
        lesson: updatedLesson,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update lesson error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث الدرس' },
      { status: 500 }
    )
  }
}

// DELETE lesson
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

    const lesson = await Lesson.findById(params.id).populate('course')

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'الدرس غير موجود' },
        { status: 404 }
      )
    }

    const course = lesson.course as any
    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بحذف هذا الدرس' },
        { status: 403 }
      )
    }

    await Lesson.findByIdAndDelete(params.id)

    await Course.findByIdAndUpdate(course._id, {
      $inc: { lessons: -1 },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الدرس بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الدرس' },
      { status: 500 }
    )
  }
}
