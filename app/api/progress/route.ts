import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Progress from '@/models/Progress'
import Enrollment from '@/models/Enrollment'
import Lesson from '@/models/Lesson'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET progress for a course
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'معرف الدورة مطلوب' },
        { status: 400 }
      )
    }

    // جلب جميع الدروس في الدورة
    const lessons = await Lesson.find({ course: courseId })
    const totalLessons = lessons.length

    // جلب التقدم من نموذج Progress
    const progress = await Progress.find({
      user: decoded.userId,
      course: courseId,
    }).populate('lesson')

    // جلب التقدم من Enrollment أيضاً
    const enrollment = await Enrollment.findOne({
      student: decoded.userId,
      course: courseId,
    }).populate('progress.lesson')

    // دمج التقدم من كلا المصدرين
    let allProgress = [...progress]
    
    // إضافة التقدم من Enrollment إذا لم يكن موجوداً في Progress
    if (enrollment?.progress) {
      for (const ep of enrollment.progress) {
        const lessonId = ep.lesson?._id?.toString() || ep.lesson?.toString()
        const exists = allProgress.find(p => 
          (p.lesson?._id?.toString() || p.lesson?.toString()) === lessonId
        )
        if (!exists && ep.completed) {
          allProgress.push({
            lesson: ep.lesson,
            completed: ep.completed,
            watchTime: ep.watchTime || 0,
            lastWatchedAt: ep.completedAt || new Date()
          } as any)
        }
      }
    }

    const completedLessons = allProgress.filter((p) => p.completed).length
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // حساب إجمالي وقت المشاهدة
    const totalWatchTime = allProgress.reduce((sum, p) => sum + (p.watchTime || 0), 0)

    // آخر درس تمت مشاهدته
    const lastWatched = allProgress.length > 0
      ? allProgress.sort((a, b) => 
          new Date(b.lastWatchedAt || 0).getTime() - new Date(a.lastWatchedAt || 0).getTime()
        )[0]
      : null

    return NextResponse.json(
      {
        success: true,
        progress: {
          totalLessons,
          completedLessons,
          completionPercentage,
          totalWatchTime,
          lastWatched,
          lessons: allProgress,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب التقدم' },
      { status: 500 }
    )
  }
}

// POST update progress
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
    const body = await request.json()
    const { courseId, lessonId, watchTime, completed } = body

    console.log('Updating progress:', { userId: decoded.userId, courseId, lessonId, completed })

    // 1. تحديث نموذج Progress
    const progress = await Progress.findOneAndUpdate(
      {
        user: decoded.userId,
        course: courseId,
        lesson: lessonId,
      },
      {
        $set: {
          completed: completed || false,
          lastWatchedAt: new Date(),
        },
        $inc: {
          watchTime: watchTime || 0,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )

    // 2. تحديث Enrollment أيضاً
    const enrollment = await Enrollment.findOne({
      student: decoded.userId,
      course: courseId,
    })

    if (enrollment) {
      // البحث عن الدرس في مصفوفة التقدم
      const lessonProgressIndex = enrollment.progress.findIndex(
        (p: any) => p.lesson?.toString() === lessonId
      )

      if (lessonProgressIndex > -1) {
        // تحديث التقدم الموجود
        enrollment.progress[lessonProgressIndex].completed = completed || false
        if (completed) {
          enrollment.progress[lessonProgressIndex].completedAt = new Date()
        }
        enrollment.progress[lessonProgressIndex].watchTime = 
          (enrollment.progress[lessonProgressIndex].watchTime || 0) + (watchTime || 0)
      } else {
        // إضافة تقدم جديد
        enrollment.progress.push({
          lesson: lessonId,
          completed: completed || false,
          completedAt: completed ? new Date() : undefined,
          watchTime: watchTime || 0,
        })
      }

      // حساب نسبة الإكمال
      const totalLessons = await Lesson.countDocuments({ course: courseId })
      const completedLessons = enrollment.progress.filter((p: any) => p.completed).length
      enrollment.completionPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0

      // تحديث حالة التسجيل إذا اكتمل
      if (enrollment.completionPercentage >= 100) {
        enrollment.status = 'completed'
      }

      await enrollment.save()
      
      console.log('Enrollment updated:', {
        completedLessons,
        totalLessons,
        completionPercentage: enrollment.completionPercentage
      })
    }

    return NextResponse.json(
      {
        success: true,
        progress,
        enrollment: enrollment ? {
          completionPercentage: enrollment.completionPercentage,
          status: enrollment.status
        } : null
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update progress error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث التقدم' },
      { status: 500 }
    )
  }
}
