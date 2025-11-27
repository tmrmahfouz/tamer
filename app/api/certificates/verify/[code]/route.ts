import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/Certificate'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await connectDB()

    const certificate = await Certificate.findOne({ verificationCode: params.code })
      .populate('student', 'name')
      .populate('course', 'title')

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'الشهادة غير موجودة أو الكود غير صحيح' },
        { status: 404 }
      )
    }

    const student = certificate.student as any
    const course = certificate.course as any
    
    return NextResponse.json(
      {
        success: true,
        valid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          studentName: student.name,
          courseName: course.title,
          issuedAt: certificate.issuedAt,
          completionDate: certificate.completionDate,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Verify certificate error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التحقق من الشهادة' },
      { status: 500 }
    )
  }
}
