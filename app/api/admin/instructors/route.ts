import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all instructors (admin only)
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Only admin can access
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const instructors = await User.find({ role: 'instructor' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    // Get courses count and students count for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const courses = await Course.find({ instructor: instructor._id }).lean()
        const coursesCount = courses.length
        const studentsCount = courses.reduce((acc, course: any) => acc + (course.studentsCount || 0), 0)

        return {
          ...instructor,
          coursesCount,
          studentsCount,
        }
      })
    )

    return NextResponse.json(
      {
        success: true,
        instructors: instructorsWithStats,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get instructors error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST create new instructor (admin only)
export async function POST(request: NextRequest) {
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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const { name, email, password, bio } = await request.json()

    // Check if email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create instructor
    const instructor = await User.create({
      name,
      email,
      password,
      role: 'instructor',
      bio,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة المعلم بنجاح',
        instructor: {
          _id: instructor._id,
          name: instructor.name,
          email: instructor.email,
          role: instructor.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create instructor error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
