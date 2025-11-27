import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإنشاء دورات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Create course
    const course = await Course.create({
      ...body,
      instructor: decoded.userId,
    })

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
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الدورة' },
      { status: 500 }
    )
  }
}
