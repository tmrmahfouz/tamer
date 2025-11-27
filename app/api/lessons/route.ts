import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'

// GET lessons by module or course
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')
    const courseId = searchParams.get('courseId')

    let query: any = {}
    
    if (moduleId) {
      query.module = moduleId
    } else if (courseId) {
      query.course = courseId
    }

    const lessons = await Lesson.find(query)
      .sort({ order: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      lessons,
    })
  } catch (error: any) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدروس' },
      { status: 500 }
    )
  }
}
