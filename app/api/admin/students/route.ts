import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Enrollment from '@/models/Enrollment'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET all students with stats
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
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    // Get enrollment count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.countDocuments({ student: student._id })
        const completedCourses = await Enrollment.countDocuments({
          student: student._id,
          completionPercentage: 100,
        })
        return {
          ...student,
          enrollments,
          completedCourses,
        }
      })
    )

    // Calculate stats
    const total = students.length
    
    // Students registered this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newThisMonth = students.filter(
      (s) => new Date(s.createdAt) >= thisMonth
    ).length

    // Active students (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const active = students.filter(
      (s: any) => s.lastLogin && new Date(s.lastLogin) >= thirtyDaysAgo
    ).length

    return NextResponse.json(
      {
        success: true,
        students: studentsWithStats,
        stats: {
          total,
          active,
          newThisMonth,
        },
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error: any) {
    console.error('❌ Get students error:', error.message)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST create new student (admin only)
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

    const { name, email, password } = await request.json()

    // Check if email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create student
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الطالب بنجاح',
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
