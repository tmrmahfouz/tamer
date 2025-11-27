import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import { verifyToken } from '@/lib/jwt'

// PUT - Update a section
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

    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const section = await Section.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        description: body.description,
        order: body.order,
        isPublished: body.isPublished,
      },
      { new: true, runValidators: true }
    )

    if (!section) {
      return NextResponse.json(
        { success: false, message: 'الموضوع غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الموضوع بنجاح',
      section,
    })
  } catch (error: any) {
    console.error('Error updating section:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث الموضوع' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a section
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

    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const section = await Section.findById(params.id)
    if (!section) {
      return NextResponse.json(
        { success: false, message: 'الموضوع غير موجود' },
        { status: 404 }
      )
    }

    await Lesson.updateMany(
      { section: params.id },
      { $unset: { section: 1 } }
    )

    await Section.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'تم حذف الموضوع بنجاح',
    })
  } catch (error: any) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الموضوع' },
      { status: 500 }
    )
  }
}
