import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all users (admin/instructor only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = verifyToken(token) as any
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return NextResponse.json(
        { success: false, message: 'توكن غير صالح' },
        { status: 401 }
      )
    }
    
    // All authenticated users can view users list (for chat)

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const query: any = {}
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      {
        success: true,
        users,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )
  } catch (error: any) {
    console.error('❌ Get users error:', error.message, error.stack)
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
