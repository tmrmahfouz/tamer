import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import VideoProgress from '@/models/VideoProgress'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    // Get recent video progress that's not completed
    const progressList = await VideoProgress.find({
      user: decoded.userId,
      isCompleted: false,
      watchedPercentage: { $gt: 0, $lt: 95 },
    })
      .sort({ lastWatchedAt: -1 })
      .limit(10)

    // Get lesson and course details
    const items = await Promise.all(
      progressList.map(async (progress) => {
        const lesson = await Lesson.findById(progress.lesson).select('title course')
        if (!lesson) return null

        const course = await Course.findById(lesson.course).select('title thumbnail')
        if (!course) return null

        return {
          lessonId: progress.lesson.toString(),
          lessonTitle: lesson.title,
          courseId: lesson.course.toString(),
          courseTitle: course.title,
          courseThumbnail: course.thumbnail || '',
          lastPosition: progress.lastPosition,
          duration: progress.duration,
          watchedPercentage: progress.watchedPercentage,
          lastWatchedAt: progress.lastWatchedAt,
        }
      })
    )

    // Filter out nulls and return
    const validItems = items.filter(Boolean)

    return NextResponse.json({
      success: true,
      items: validItems,
    })
  } catch (error) {
    console.error('Error fetching continue watching:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
