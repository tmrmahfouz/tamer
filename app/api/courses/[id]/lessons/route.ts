import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    console.log('📝 Creating new lesson for course:', params.id)
    await connectDB()
    console.log('✅ Connected to DB')

    // Get token from cookie
    const token = request.cookies.get('token')?.value
    console.log('🔐 Token exists:', !!token)

    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    console.log('🔍 Verifying token...')
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ Token verified, user role:', decoded.role)

    // Check if user is admin or instructor
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإضافة دروس' },
        { status: 403 }
      )
    }

    // Check if course exists
    console.log('🔍 Checking if course exists...')
    const course = await Course.findById(params.id)
    if (!course) {
      console.log('❌ Course not found')
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }
    console.log('✅ Course found:', course.title)

    // Check if user owns the course
    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      console.log('❌ User does not own this course')
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإضافة دروس لهذه الدورة' },
        { status: 403 }
      )
    }

    console.log('📥 Reading request body...')
    const body = await request.json()
    console.log('📋 Lesson data:', body)

    // Get the highest order number
    console.log('🔢 Getting last lesson order...')
    const lastLesson = await Lesson.findOne({ course: params.id })
      .sort({ order: -1 })
      .select('order')

    const order = lastLesson ? lastLesson.order + 1 : 0
    console.log('📊 New lesson order:', order)

    // Create lesson with proper structure supporting all types
    console.log('💾 Creating lesson...')
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
    console.log('✅ Lesson created:', lesson._id)

    // Update course lessons count
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
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الدرس', error: error.message },
      { status: 500 }
    )
  }
}
