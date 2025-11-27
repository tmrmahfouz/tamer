import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CourseBundle from '@/models/CourseBundle'

// GET - جلب حزمة واحدة للعرض العام
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const bundle = await CourseBundle.findById(id)
      .populate('courses', 'title price thumbnail description')
    
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'الحزمة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, bundle })
  } catch (error) {
    console.error('Error fetching bundle:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزمة' },
      { status: 500 }
    )
  }
}
