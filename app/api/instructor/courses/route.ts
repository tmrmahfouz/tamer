import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const user = await User.findById(decoded.userId)
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    // Get only instructor's courses (admin sees all)
    const query = user.role === 'admin' ? {} : { instructor: decoded.userId }
    const courses = await Course.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, courses })
  } catch (error: any) {
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
