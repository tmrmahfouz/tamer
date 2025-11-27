import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import QuizAttempt from '@/models/QuizAttempt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Submit quiz attempt
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    await connectDB()

    const quiz = await Quiz.findById(params.id)
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'الاختبار غير موجود' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { answers, timeSpent, startedAt } = body

    // Calculate score
    let score = 0
    let totalPoints = 0
    const processedAnswers = []

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]
      const studentAnswer = answers[i]
      
      totalPoints += question.points
      
      let isCorrect = false
      
      // Check answer based on question type
      if (question.type === 'short-answer') {
        // Case-insensitive comparison for short answers
        isCorrect = String(studentAnswer).trim().toLowerCase() === 
                   String(question.correctAnswer).trim().toLowerCase()
      } else {
        isCorrect = String(studentAnswer) === String(question.correctAnswer)
      }
      
      const points = isCorrect ? question.points : 0
      score += points
      
      processedAnswers.push({
        questionIndex: i,
        answer: studentAnswer,
        isCorrect,
        points,
      })
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
    const passed = percentage >= quiz.passingScore

    // Save attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: decoded.userId,
      course: quiz.course,
      answers: processedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      timeSpent: timeSpent || 0,
      startedAt: startedAt || new Date(),
      completedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      attempt: {
        _id: attempt._id,
        score,
        totalPoints,
        percentage,
        passed,
        answers: processedAnswers,
      },
      message: passed ? 'تهانينا! لقد نجحت في الاختبار' : 'للأسف، لم تنجح في الاختبار',
    })
  } catch (error: any) {
    console.error('Submit quiz attempt error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تقديم الاختبار' },
      { status: 500 }
    )
  }
}

// GET - Get student's attempts for this quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    await connectDB()

    const attempts = await QuizAttempt.find({
      quiz: params.id,
      student: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      attempts,
    })
  } catch (error: any) {
    console.error('Get quiz attempts error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المحاولات' },
      { status: 500 }
    )
  }
}
