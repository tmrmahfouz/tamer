import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - جلب مشاريع الطالب الحالي
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    const projects = await Project.find({ student: user._id })
      .populate('course', 'title thumbnail')
      .populate('feedback.reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      projects
    })
  } catch (error) {
    console.error('Error fetching student projects:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشاريع' },
      { status: 500 }
    )
  }
}
