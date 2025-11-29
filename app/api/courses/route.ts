import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

// GET all courses
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const published = searchParams.get('published')

    let query: any = {}
    
    if (category) query.category = category
    if (level) query.level = level
    if (published !== null) query.published = published === 'true'

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        count: courses.length,
        courses,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدورات' },
      { status: 500 }
    )
  }
}

// POST create new course (Admin/Instructor only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - لا يوجد توكن' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - توكن غير صالح' },
        { status: 401 }
      )
    }
    
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإنشاء دورات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.duration) {
      return NextResponse.json(
        { success: false, message: 'الرجاء ملء جميع الحقول المطلوبة (العنوان، الوصف، الفئة، المدة)' },
        { status: 400 }
      )
    }
    
    // Create course with validated data
    const courseData = {
      title: body.title,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory || '',
      level: body.level || 'مبتدئ',
      price: body.price || 0,
      duration: body.duration,
      image: body.image || '🎓',
      topics: body.topics || [],
      published: body.published || false,
      dripEnabled: body.dripEnabled || false,
      dripType: body.dripType || 'days',
      dripInterval: body.dripInterval || 7,
      dripStartDate: body.dripStartDate || null,
      enforceSequentialLessons: body.enforceSequentialLessons || false,
      instructor: decoded.userId,
    }
    
    const course = await Course.create(courseData)

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الدورة بنجاح',
        course,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create course error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message)
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ أثناء إنشاء الدورة' },
      { status: 500 }
    )
  }
}
