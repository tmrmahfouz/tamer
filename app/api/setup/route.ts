import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// هذا الـ endpoint لإنشاء حساب الأدمن مرة واحدة فقط
// بعد الاستخدام، احذف هذا الملف لأسباب أمنية

export async function GET(request: NextRequest) {
  try {
    // مفتاح سري للحماية - غيره لقيمة خاصة بك
    const secretKey = request.nextUrl.searchParams.get('key')
    if (secretKey !== 'setup-admin-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // تحقق إذا كان الأدمن موجود
    const existingAdmin = await User.findOne({ email: 'admin@tamermahfouz.com' })
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'حساب الأدمن موجود بالفعل',
        email: 'admin@tamermahfouz.com'
      })
    }

    // إنشاء حساب الأدمن
    const admin = await User.create({
      name: 'تامر محفوظ',
      email: 'admin@tamermahfouz.com',
      password: 'admin123',
      role: 'admin',
      bio: 'مهندس برمجيات ومتخصص في الذكاء الاصطناعي',
      phone: '+20 123 456 7890',
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب الأدمن بنجاح!',
      credentials: {
        email: 'admin@tamermahfouz.com',
        password: 'admin123'
      },
      warning: '⚠️ احذف ملف app/api/setup/route.ts بعد الاستخدام!'
    })

  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
