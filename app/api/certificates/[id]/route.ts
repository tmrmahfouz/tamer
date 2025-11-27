import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/Certificate'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const certificate = await Certificate.findById(params.id)
      .populate('student', 'name email')
      .populate('course', 'title description image instructor')

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'الشهادة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        certificate,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get certificate error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الشهادة' },
      { status: 500 }
    )
  }
}
