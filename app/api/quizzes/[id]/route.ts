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
    const id = params.id
    
    // التحقق من صحة الـ ID
    const mongoose = await import('mongoose')
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'معرف الاختبار غير صالح' },
        { status: 400 }
      )
    }

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
    
    console.log('Update quiz body:', body)
    
    // بناء كائن التحديث فقط بالحقول الموجودة
    const updateData: any = {}
    
    // إضافة الحقول فقط إذا كانت موجودة في الطلب
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.passingScore !== undefined) updateData.passingScore = body.passingScore
    if (body.timeLimit !== undefined) updateData.timeLimit = body.timeLimit
    if (body.maxAttempts !== undefined) updateData.maxAttempts = body.maxAttempts
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    
    // إضافة الدورة (دعم course أو courseId)
    const courseId = body.course || body.courseId
    if (courseId) updateData.course = courseId
    
    // إضافة الدرس (دعم lesson أو lessonId)
    const lessonId = body.lesson || body.lessonId
    if (lessonId) {
      updateData.lesson = lessonId
    }
    
    // إضافة الأسئلة إذا وجدت
    if (body.questions !== undefined && Array.isArray(body.questions)) {
      // تنظيف الأسئلة قبل الحفظ
      updateData.questions = body.questions.map((q: any) => {
        const cleanQuestion: any = {
          question: q.question || '',
          type: q.type || 'multiple-choice',
          points: q.points || 1,
        }
        
        // إضافة الحقول حسب نوع السؤال
        if (q.type === 'multiple-choice') {
          cleanQuestion.options = q.options || []
          cleanQuestion.correctAnswer = q.correctAnswer || ''
        } else if (q.type === 'true-false') {
          cleanQuestion.correctAnswer = q.correctAnswer || ''
        } else if (q.type === 'short-answer') {
          cleanQuestion.correctAnswer = q.correctAnswer || ''
        } else if (q.type === 'matching') {
          cleanQuestion.matchingPairs = q.matchingPairs || []
        } else if (q.type === 'ordering') {
          cleanQuestion.orderItems = q.orderItems || []
          cleanQuestion.correctAnswer = q.correctAnswer || []
        }
        
        if (q.explanation) cleanQuestion.explanation = q.explanation
        if (q._id) cleanQuestion._id = q._id
        
        return cleanQuestion
      })
    }

    console.log('Update data:', JSON.stringify(updateData, null, 2))

    // تحديث الاختبار
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false } // تعطيل التحقق لتجنب مشاكل الحقول الاختيارية
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
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ أثناء تحديث الاختبار',
        error: error.message,
        details: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : undefined
      },
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
