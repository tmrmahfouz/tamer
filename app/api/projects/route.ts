import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - جلب المشاريع
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const isPublic = searchParams.get('public')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    const query: any = {}
    
    if (courseId) query.course = courseId
    if (studentId) query.student = studentId
    if (status) query.status = status
    if (isPublic === 'true') query.isPublic = true
    if (featured === 'true') query.status = 'featured'
    
    const skip = (page - 1) * limit
    
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('student', 'name image')
        .populate('course', 'title thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query)
    ])
    
    return NextResponse.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشاريع' },
      { status: 500 }
    )
  }
}

// POST - إنشاء مشروع جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // التحقق من المصادقة
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    // فك تشفير التوكن
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    const { title, description, courseId, lessonId, files, liveUrl, repoUrl, technologies, isPublic, assignmentId } = data
    
    if (!title || !description || !courseId) {
      return NextResponse.json(
        { success: false, error: 'العنوان والوصف والدورة مطلوبين' },
        { status: 400 }
      )
    }
    
    const project = await Project.create({
      title,
      description,
      course: courseId,
      lesson: lessonId || undefined,
      student: user._id,
      files: files || [],
      liveUrl: liveUrl || '',
      repoUrl: repoUrl || '',
      technologies: technologies || [],
      isPublic: isPublic || false,
      assignment: assignmentId || undefined,
      status: 'draft'
    })
    
    await project.populate('student', 'name image')
    await project.populate('course', 'title thumbnail')
    
    return NextResponse.json({
      success: true,
      project
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المشروع' },
      { status: 500 }
    )
  }
}
