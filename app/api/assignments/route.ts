import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET assignments
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    const query: any = { isPublished: true }
    if (courseId) query.course = courseId
    if (lessonId) query.lesson = lessonId

    const assignments = await Assignment.find(query)
      .populate('lesson', 'title')
      .sort({ dueDate: 1 })

    return NextResponse.json(
      {
        success: true,
        assignments,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get assignments error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST create assignment (instructor only)
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

    if (decoded.role !== 'instructor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const assignment = await Assignment.create({
      ...body,
      instructor: decoded.userId,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الواجب بنجاح',
        assignment,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
