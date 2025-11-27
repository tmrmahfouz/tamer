import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tamer-mahfouz-jwt-secret-2024-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Check if user is admin or instructor
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك برفع الملفات' },
        { status: 403 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'نوع الملف غير مدعوم. يرجى رفع ملف PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'حجم الملف كبير جداً. الحد الأقصى 50MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const filename = `pdf_${timestamp}_${randomString}.pdf`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pdfs')
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return file URL
    const fileUrl = `/uploads/pdfs/${filename}`

    return NextResponse.json({
      success: true,
      message: 'تم رفع ملف PDF بنجاح',
      data: {
        url: fileUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error: any) {
    console.error('Upload PDF error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء رفع ملف PDF', error: error.message },
      { status: 500 }
    )
  }
}
