import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET - Get all sections for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const sections = await Section.find({ course: params.id })
      .sort({ order: 1 })
      .lean()

    // Get lessons for each section
    const sectionsWithLessons = await Promise.all(
      sections.map(async (section) => {
        const lessons = await Lesson.find({ section: section._id })
          .sort({ order: 1 })
          .lean()
        
        return {
          ...section,
          lessons,
        }
      })
    )

    // Get lessons without section
    const lessonsWithoutSection = await Lesson.find({
      course: params.id,
      $or: [{ section: null }, { section: { $exists: false } }],
    })
      .sort({ order: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      sections: sectionsWithLessons,
      lessonsWithoutSection,
    })
  } catch (error: any) {
    console.error('Error fetching sections:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الموضوعات' },
      { status: 500 }
    )
  }
}

// POST - Create a new section
export async function POST(
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Get the highest order number
    const lastSection = await Section.findOne({ course: params.id })
      .sort({ order: -1 })
      .select('order')

    const order = lastSection ? lastSection.order + 1 : 0

    const section = await Section.create({
      title: body.title,
      description: body.description || '',
      course: params.id,
      order: body.order !== undefined ? body.order : order,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة الموضوع بنجاح',
        section,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating section:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إضافة الموضوع' },
      { status: 500 }
    )
  }
}
