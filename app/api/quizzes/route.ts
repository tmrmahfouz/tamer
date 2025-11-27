import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all quizzes (or filtered by course/instructor)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const myQuizzes = searchParams.get('myQuizzes')

    let query: any = {}
    
    // إذا كان المطلوب اختبارات المعلم فقط
    if (myQuizzes === 'true') {
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
      
      // جلب دورات المعلم
      const instructorCourses = await Course.find({ instructor: decoded.userId }).select('_id')
      const courseIds = instructorCourses.map(c => c._id)
      
      query = { course: { $in: courseIds } }
    } else if (courseId) {
      query = { course: courseId }
    }

    console.log('🔍 جاري البحث عن الاختبارات...')
    
    // Import models to ensure they are registered
    await import('@/models/Lesson')
    await import('@/models/Course')
    
    const quizzes = await Quiz.find(query)
      .populate('lesson', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 })

    console.log('✅ تم جلب الاختبارات:', quizzes.length)

    return NextResponse.json(
      {
        success: true,
        count: quizzes.length,
        quizzes,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ خطأ في جلب الاختبارات:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ أثناء جلب الاختبارات',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST create new quiz
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإنشاء اختبارات' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const quiz = await Quiz.create(body)

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الاختبار بنجاح',
        quiz,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الاختبار' },
      { status: 500 }
    )
  }
}
