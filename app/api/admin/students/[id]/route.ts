import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// PUT update student (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const student = await User.findById(params.id)
    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    // Update fields
    if (name) student.name = name
    if (email) student.email = email

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      student.password = await bcrypt.hash(password, salt)
    }

    await student.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الطالب بنجاح',
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE student (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const student = await User.findById(params.id)
    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    await User.findByIdAndDelete(params.id)

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الطالب بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
