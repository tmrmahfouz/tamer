import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Module from '@/models/Module'
import Lesson from '@/models/Lesson'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET single module
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const module = await Module.findById(params.id).lean()

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'الوحدة غير موجودة' },
        { status: 404 }
      )
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ module: params.id })
      .sort({ order: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      module: {
        ...module,
        lessons,
      },
    })
  } catch (error: any) {
    console.error('Get module error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الوحدة' },
      { status: 500 }
    )
  }
}

// PUT update module
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { title, description, order, duration, published } = body

    const module = await Module.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        order,
        duration,
        published,
      },
      { new: true, runValidators: true }
    )

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'الوحدة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      module,
      message: 'تم تحديث الوحدة بنجاح',
    })
  } catch (error: any) {
    console.error('Update module error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث الوحدة' },
      { status: 500 }
    )
  }
}

// DELETE module
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if module has lessons
    const lessonsCount = await Lesson.countDocuments({ module: params.id })
    if (lessonsCount > 0) {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف وحدة تحتوي على دروس. احذف الدروس أولاً.' },
        { status: 400 }
      )
    }

    const module = await Module.findByIdAndDelete(params.id)

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'الوحدة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الوحدة بنجاح',
    })
  } catch (error: any) {
    console.error('Delete module error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الوحدة' },
      { status: 500 }
    )
  }
}
