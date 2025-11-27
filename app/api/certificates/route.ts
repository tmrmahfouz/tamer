import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Dynamic imports to avoid model registration issues
const getCertificateModel = async () => {
  const { default: Certificate } = await import('@/models/Certificate')
  return Certificate
}

const getEnrollmentModel = async () => {
  const { default: Enrollment } = await import('@/models/Enrollment')
  return Enrollment
}

// GET user certificates
export async function GET(request: NextRequest) {
  try {
    console.log('📜 Fetching certificates...')
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json(
        { success: false, message: 'غير مصرح', certificates: [] },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('✅ Token verified for user:', decoded.userId)
    } catch (jwtError: any) {
      console.error('❌ JWT verification error:', jwtError.message)
      return NextResponse.json(
        { success: false, message: 'جلسة غير صالحة', certificates: [] },
        { status: 401 }
      )
    }

    if (!decoded?.userId) {
      console.log('❌ No userId in token')
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم غير موجود', certificates: [] },
        { status: 401 }
      )
    }

    const Certificate = await getCertificateModel()
    
    const certificates = await Certificate.find({ student: decoded.userId })
      .populate('course', 'title image')
      .populate('student', 'name email')
      .sort({ issuedAt: -1 })
      .lean()

    console.log(`✅ Found ${certificates.length} certificates`)

    return NextResponse.json(
      {
        success: true,
        count: certificates.length,
        certificates: certificates || [],
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Get certificates error:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الشهادات', certificates: [], error: error.message },
      { status: 500 }
    )
  }
}

// POST generate certificate
export async function POST(request: NextRequest) {
  try {
    console.log('🎓 Generating certificate...')
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (jwtError: any) {
      console.error('❌ JWT error:', jwtError.message)
      return NextResponse.json(
        { success: false, message: 'جلسة غير صالحة' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { enrollmentId } = body

    const Enrollment = await getEnrollmentModel()
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course')
      .populate('student')

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'التسجيل غير موجود' },
        { status: 404 }
      )
    }

    if (enrollment.student._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Import Lesson model to count total lessons
    const Lesson = (await import('@/models/Lesson')).default
    const totalLessons = await Lesson.countDocuments({ course: enrollment.course._id })
    const completedLessons = enrollment.progress?.filter((p: any) => p.completed).length || 0
    
    // Calculate actual completion percentage
    const actualCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    
    console.log('Enrollment data:', {
      id: enrollment._id,
      storedCompletion: enrollment.completionPercentage,
      actualCompletion,
      totalLessons,
      completedLessons,
      progressCount: enrollment.progress?.length,
    })

    // Update completion percentage if different
    if (actualCompletion !== enrollment.completionPercentage) {
      enrollment.completionPercentage = actualCompletion
      await enrollment.save()
    }

    if (actualCompletion < 100) {
      return NextResponse.json(
        { success: false, message: `يجب إكمال الدورة أولاً (التقدم الحالي: ${actualCompletion}% - ${completedLessons}/${totalLessons} درس)` },
        { status: 400 }
      )
    }

    // التحقق من تفعيل الشهادة في الدورة
    const courseData = enrollment.course as any
    if (courseData.certificateEnabled === false) {
      return NextResponse.json(
        { success: false, message: 'الشهادات غير مفعّلة لهذه الدورة' },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const Certificate = await getCertificateModel()
    const existingCert = await Certificate.findOne({
      student: decoded.userId,
      course: enrollment.course._id,
    })

    if (existingCert) {
      return NextResponse.json(
        {
          success: true,
          message: 'الشهادة موجودة بالفعل',
          certificate: existingCert,
        },
        { status: 200 }
      )
    }

    // Generate certificate number and verification code
    const certCount = await Certificate.countDocuments()
    const certificateNumber = `CERT-${Date.now()}-${(certCount + 1).toString().padStart(6, '0')}`
    const verificationCode = Math.random().toString(36).substr(2, 9).toUpperCase()

    // Create certificate
    const certificate = await Certificate.create({
      student: decoded.userId,
      course: enrollment.course._id,
      enrollment: enrollmentId,
      completionDate: new Date(),
      grade: enrollment.completionPercentage,
      certificateNumber,
      verificationCode,
      issuedAt: new Date(),
    })

    // Update enrollment
    await Enrollment.findByIdAndUpdate(enrollmentId, {
      certificateIssued: true,
      certificateIssuedAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إصدار الشهادة بنجاح',
        certificate,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Generate certificate error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إصدار الشهادة' },
      { status: 500 }
    )
  }
}
