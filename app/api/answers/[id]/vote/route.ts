import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Answer from '@/models/Answer'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST vote on answer
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
    const { vote } = body

    if (!['up', 'down'].includes(vote)) {
      return NextResponse.json(
        { success: false, message: 'نوع التصويت غير صحيح' },
        { status: 400 }
      )
    }

    const answer = await Answer.findById(params.id)
    if (!answer) {
      return NextResponse.json(
        { success: false, message: 'الإجابة غير موجودة' },
        { status: 404 }
      )
    }

    const existingVoteIndex = answer.votedBy.findIndex(
      (v: any) => v.user.toString() === decoded.userId
    )

    if (existingVoteIndex !== -1) {
      const existingVote = answer.votedBy[existingVoteIndex].vote

      if (existingVote === 'up') {
        answer.upvotes--
      } else {
        answer.downvotes--
      }

      if (existingVote === vote) {
        answer.votedBy.splice(existingVoteIndex, 1)
      } else {
        answer.votedBy[existingVoteIndex].vote = vote
        if (vote === 'up') {
          answer.upvotes++
        } else {
          answer.downvotes++
        }
      }
    } else {
      answer.votedBy.push({ user: decoded.userId as any, vote: vote as any })
      if (vote === 'up') {
        answer.upvotes++
      } else {
        answer.downvotes++
      }
    }

    await answer.save()

    return NextResponse.json(
      {
        success: true,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Vote answer error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
