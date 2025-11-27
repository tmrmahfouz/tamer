import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

// This endpoint returns the actual YouTube video ID only if the token is valid
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Verify the token
    const decoded = jwt.verify(params.token, JWT_SECRET) as any

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return NextResponse.json(
        { success: false, message: 'انتهت صلاحية الرابط' },
        { status: 401 }
      )
    }

    // Check if user matches
    const userToken = request.cookies.get('token')?.value
    if (!userToken) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const user = jwt.verify(userToken, JWT_SECRET) as any
    if (user.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'هذا الرابط غير مخصص لك' },
        { status: 403 }
      )
    }

    // Return the video ID (not the full URL for extra security)
    return NextResponse.json({
      success: true,
      videoId: decoded.videoId,
      lessonId: decoded.lessonId,
      studentName: user.name,
    })
  } catch (error: any) {
    console.error('Video token error:', error)
    return NextResponse.json(
      { success: false, message: 'رابط غير صالح' },
      { status: 401 }
    )
  }
}
