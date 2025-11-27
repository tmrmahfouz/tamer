import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// PUT update instructor (admin only)
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

    const { name, email, password, bio } = await request.json()

    const instructor = await User.findById(params.id)
    if (!instructor || instructor.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'المعلم غير موجود' },
        { status: 404 }
      )
    }

    // Update fields
    if (name) instructor.name = name
    if (email) instructor.email = email
    if (bio !== undefined) instructor.bio = bio

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      instructor.password = await bcrypt.hash(password, salt)
    }

    await instructor.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث المعلم بنجاح',
        instructor: {
          _id: instructor._id,
          name: instructor.name,
          email: instructor.email,
          role: instructor.role,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update instructor error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// DELETE instructor (admin only)
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

    const instructor = await User.findById(params.id)
    if (!instructor || instructor.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'المعلم غير موجود' },
        { status: 404 }
      )
    }

    await User.findByIdAndDelete(params.id)

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف المعلم بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete instructor error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
