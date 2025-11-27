import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'

// GET single quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const quiz = await Quiz.findById(params.id)
      .populate('lesson', 'title')
      .populate('course', 'title')

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'الاختبار غير موجود' },
        { status: 404 }
      )
    }

    // Don't send correct answers to students
    const token = request.cookies.get('token')?.value
    let isInstructor = false

    if (token) {
      try {
        const decoded = verifyToken(token)
        if (decoded) {
          isInstructor = decoded.role === 'admin' || decoded.role === 'instructor'
        }
      } catch (error) {
        // Invalid token, treat as student
      }
    }

    if (!isInstructor) {
      // Remove correct answers for students but keep lesson and course info
      const quizData: any = quiz.toObject()
      quizData.questions = quizData.questions.map((q: any) => ({
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
      }))
      
      return NextResponse.json(
        {
          success: true,
          quiz: {
            ...quizData,
            lesson: quiz.lesson,
            course: quiz.course,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        quiz,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الاختبار' },
      { status: 500 }
    )
  }
}

// PUT update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - لم يتم العثور على رمز الدخول' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بتعديل الاختبارات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // تنظيف البيانات قبل التحديث
    const updateData: any = {
      title: body.title,
      description: body.description,
      passingScore: body.passingScore,
      timeLimit: body.timeLimit,
      maxAttempts: body.maxAttempts,
      isPublished: body.isPublished,
    }
    
    // إضافة الدورة والدرس إذا وجدا
    if (body.course) updateData.course = body.course
    if (body.lesson) updateData.lesson = body.lesson
    else updateData.lesson = null
    
    // إضافة الأسئلة إذا وجدت
    if (body.questions) updateData.questions = body.questions

    const quiz = await Quiz.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'الاختبار غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الاختبار بنجاح',
        quiz,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث الاختبار: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE quiz
export async function DELETE(
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
        { success: false, message: 'غير مصرح لك بحذف الاختبارات' },
        { status: 403 }
      )
    }

    const quiz = await Quiz.findByIdAndDelete(params.id)

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'الاختبار غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الاختبار بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الاختبار' },
      { status: 500 }
    )
  }
}
