import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Get user
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          enrolledCourses: user.enrolledCourses,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'غير مصرح' },
      { status: 401 }
    )
  }
}
