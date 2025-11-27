import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST vote on question
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()
    const { vote } = body // 'up' or 'down'

    if (!['up', 'down'].includes(vote)) {
      return NextResponse.json(
        { success: false, message: 'نوع التصويت غير صحيح' },
        { status: 400 }
      )
    }

    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من التصويت السابق
    const existingVoteIndex = question.votedBy.findIndex(
      (v: any) => v.user.toString() === decoded.userId
    )

    if (existingVoteIndex !== -1) {
      const existingVote = question.votedBy[existingVoteIndex].vote

      // إزالة التصويت السابق
      if (existingVote === 'up') {
        question.upvotes--
      } else {
        question.downvotes--
      }

      // إذا كان نفس التصويت، إلغاء التصويت
      if (existingVote === vote) {
        question.votedBy.splice(existingVoteIndex, 1)
      } else {
        // تغيير التصويت
        question.votedBy[existingVoteIndex].vote = vote
        if (vote === 'up') {
          question.upvotes++
        } else {
          question.downvotes++
        }
      }
    } else {
      // تصويت جديد
      question.votedBy.push({ user: decoded.userId as any, vote: vote as any })
      if (vote === 'up') {
        question.upvotes++
      } else {
        question.downvotes++
      }
    }

    await question.save()

    return NextResponse.json(
      {
        success: true,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Vote question error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
