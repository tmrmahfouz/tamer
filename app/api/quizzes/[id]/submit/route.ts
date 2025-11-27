import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(
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
    const body = await request.json()
    const { answers } = body // answers: { questionIndex: answer }

    const quiz = await Quiz.findById(params.id)

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'الاختبار غير موجود' },
        { status: 404 }
      )
    }

    // Calculate score
    let correctAnswers = 0
    let totalPoints = 0
    let earnedPoints = 0

    const results = quiz.questions.map((question: any, index: number) => {
      totalPoints += question.points
      const userAnswer = answers[index]
      const isCorrect = String(userAnswer) === String(question.correctAnswer)

      if (isCorrect) {
        correctAnswers++
        earnedPoints += question.points
      }

      return {
        questionIndex: index,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0,
        explanation: question.explanation,
      }
    })

    const percentage = Math.round((earnedPoints / totalPoints) * 100)
    const passed = percentage >= quiz.passingScore

    // TODO: Save quiz attempt to database
    // await QuizAttempt.create({
    //   student: decoded.userId,
    //   quiz: quiz._id,
    //   answers: results,
    //   score: percentage,
    //   passed,
    // })

    return NextResponse.json(
      {
        success: true,
        results: {
          totalQuestions: quiz.questions.length,
          correctAnswers,
          totalPoints,
          earnedPoints,
          percentage,
          passed,
          passingScore: quiz.passingScore,
          details: results,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Submit quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تقييم الاختبار' },
      { status: 500 }
    )
  }
}
