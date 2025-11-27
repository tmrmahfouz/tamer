import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Get lesson ID from query
    const lessonId = request.nextUrl.searchParams.get('lesson')
    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: 'معرف الدرس مطلوب' },
        { status: 400 }
      )
    }

    // Verify user token
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Connect to DB and get lesson
    await connectDB()
    const lesson = await Lesson.findById(lessonId)

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'الدرس غير موجود' },
        { status: 404 }
      )
    }

    // Extract YouTube video ID
    const videoUrl = lesson.content?.videoUrl || ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = videoUrl.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'رابط الفيديو غير صحيح' },
        { status: 400 }
      )
    }

    // Create a secure token with expiration
    const secureToken = jwt.sign(
      {
        videoId,
        userId: decoded.userId,
        lessonId,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      },
      JWT_SECRET
    )

    // Return the secure token and user info
    return NextResponse.json({
      success: true,
      token: secureToken,
      studentName: decoded.name,
      lessonTitle: lesson.title,
    })
  } catch (error: any) {
    console.error('Secure video error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
