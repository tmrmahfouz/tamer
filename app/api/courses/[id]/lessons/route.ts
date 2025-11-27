import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

// GET all lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const lessons = await Lesson.find({ course: params.id })
      .sort({ order: 1 })
      .select('-__v')

    return NextResponse.json(
      {
        success: true,
        count: lessons.length,
        lessons,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدروس' },
      { status: 500 }
    )
  }
}

// POST create new lesson
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

    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإضافة دروس' },
        { status: 403 }
      )
    }

    const course = await Course.findById(params.id)
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإضافة دروس لهذه الدورة' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const lastLesson = await Lesson.findOne({ course: params.id })
      .sort({ order: -1 })
      .select('order')

    const order = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await Lesson.create({
      title: body.title,
      description: body.description || '',
      course: params.id,
      order: body.order !== undefined ? body.order : order,
      type: body.type || 'video',
      content: body.content || {},
      attachments: body.attachments || [],
      isFree: body.isFree || false,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
    })

    await Course.findByIdAndUpdate(params.id, {
      $inc: { lessons: 1 },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الدرس بنجاح',
        lesson,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الدرس', error: error.message },
      { status: 500 }
    )
  }
}
