import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

// GET single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const course = await Course.findById(params.id).populate(
      'instructor',
      'name email avatar bio'
    )

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        course,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الدورة' },
      { status: 500 }
    )
  }
}

// PUT update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const course = await Course.findById(params.id)

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if user is the instructor or admin
    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بتعديل هذه الدورة' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'تم تحديث الدورة بنجاح',
        course: updatedCourse,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث الدورة' },
      { status: 500 }
    )
  }
}

// DELETE course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const course = await Course.findById(params.id)

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'الدورة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if user is the instructor or admin
    if (
      decoded.role !== 'admin' &&
      course.instructor.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بحذف هذه الدورة' },
        { status: 403 }
      )
    }

    await Course.findByIdAndDelete(params.id)

    return NextResponse.json(
      {
        success: true,
        message: 'تم حذف الدورة بنجاح',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الدورة' },
      { status: 500 }
    )
  }
}
