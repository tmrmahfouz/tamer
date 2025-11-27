import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Module from '@/models/Module'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all modules for a course
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'معرف الدورة مطلوب' },
        { status: 400 }
      )
    }

    const modules = await Module.find({ course: courseId })
      .sort({ order: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      modules,
    })
  } catch (error: any) {
    console.error('Get modules error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الوحدات' },
      { status: 500 }
    )
  }
}

// POST create new module
export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'instructor')) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await req.json()
    const { title, description, course, order, duration, published } = body

    if (!title || !course) {
      return NextResponse.json(
        { success: false, message: 'العنوان ومعرف الدورة مطلوبان' },
        { status: 400 }
      )
    }

    const module = await Module.create({
      title,
      description: description || '',
      course,
      order: order || 0,
      duration: duration || '',
      published: published !== undefined ? published : true,
    })

    return NextResponse.json({
      success: true,
      module,
      message: 'تم إنشاء الوحدة بنجاح',
    })
  } catch (error: any) {
    console.error('Create module error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الوحدة' },
      { status: 500 }
    )
  }
}
