import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Quiz from '@/models/Quiz'
import { verifyToken } from '@/lib/jwt'

// GET - جلب كل بيانات صفحة التعلم دفعة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    await connectDB()

    const { courseId, lessonId } = params

    // التحقق من المستخدم
    const token = request.cookies.get('token')?.value
    let user: any = null
    let enrollment: any = null
    let completedLessons: string[] = []

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        // جلب بيانات المستخدم من قاعدة البيانات
        const User = (await import('@/models/User')).default
        const userData = await User.findById(decoded.userId).select('name email').lean()
        
        user = { 
          id: decoded.userId, 
          role: decoded.role,
          name: (userData as any)?.name || 'مستخدم',
          email: (userData as any)?.email
        }
        
        // جلب التسجيل والتقدم
        enrollment = await Enrollment.findOne({
          student: decoded.userId,
          course: courseId,
        }).lean()

        if (enrollment?.progress) {
          completedLessons = enrollment.progress
            .filter((p: any) => p.completed)
            .map((p: any) => String(p.lesson))
        }
      }
    }

    // جلب البيانات بالتوازي
    const [lesson, course, allLessons, quizzes] = await Promise.all([
      Lesson.findById(lessonId).lean(),
      Course.findById(courseId).select('title instructor certificateEnabled enforceSequentialLessons').lean(),
      Lesson.find({ course: courseId }).select('_id title order isFree type').sort({ order: 1 }).lean(),
      Quiz.find({ course: courseId, isPublished: true }).select('_id title lesson passingScore questions timeLimit').lean(),
    ])

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'الدرس غير موجود' },
        { status: 404 }
      )
    }

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من الوصول
    const lessonData = lesson as any
    const isEnrolled = !!enrollment
    const canAccess = lessonData.isFree || 
                      user?.role === 'admin' || 
                      (user?.role === 'instructor' && String((course as any).instructor) === user.id) ||
                      isEnrolled

    // البحث عن اختبار الدرس
    const lessonQuiz = quizzes.find((q: any) => String(q.lesson) === lessonId)

    // حساب الدرس الحالي مكتمل أم لا
    const isCurrentLessonCompleted = completedLessons.includes(lessonId)

    return NextResponse.json({
      success: true,
      data: {
        lesson,
        course,
        lessons: allLessons,
        quizzes, // إضافة جميع الاختبارات
        lessonQuiz: lessonQuiz || null,
        enrollment: enrollment ? {
          _id: enrollment._id,
          completionPercentage: enrollment.completionPercentage,
          certificateIssued: enrollment.certificateIssued,
        } : null,
        completedLessons,
        isCurrentLessonCompleted,
        isEnrolled,
        canAccess,
        user: user ? { id: user.id, role: user.role, name: user.name } : null,
      },
    })
  } catch (error: any) {
    console.error('Learn page data error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحميل البيانات' },
      { status: 500 }
    )
  }
}
