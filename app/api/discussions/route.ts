import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Discussion from '@/models/Discussion'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET - جلب المناقشات
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!courseId) {
      return NextResponse.json({ success: false, message: 'معرف الدورة مطلوب' }, { status: 400 })
    }

    const query: any = { course: courseId }
    if (lessonId) query.lesson = lessonId
    if (type) query.type = type

    const total = await Discussion.countDocuments(query)
    const discussions = await Discussion.find(query)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      success: true,
      discussions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - إنشاء مناقشة جديدة
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, lessonId, title, content, type, tags } = body

    if (!courseId || !title || !content) {
      return NextResponse.json({ success: false, message: 'بيانات ناقصة' }, { status: 400 })
    }

    const discussion = await Discussion.create({
      course: courseId,
      lesson: lessonId || null,
      user: decoded.userId,
      title,
      content,
      type: type || 'question',
      tags: tags || [],
    })

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name avatar')

    return NextResponse.json({ success: true, discussion: populated })
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
