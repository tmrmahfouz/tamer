import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    verifyToken(token)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let url = `/uploads/chat/${filename}`

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'chat')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
    } catch (fsError: any) {
      console.warn('Local filesystem is read-only. Falling back to Base64 data URI:', fsError.message)
      const base64Data = buffer.toString('base64')
      url = `data:${file.type || 'application/octet-stream'};base64,${base64Data}`
    }

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    )
  }
}
