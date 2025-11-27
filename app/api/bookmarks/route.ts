import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Bookmark from '@/models/Bookmark'
import { verifyToken } from '@/lib/jwt'

// GET - جلب العلامات المرجعية
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')

    const query: any = { user: decoded.userId }
    
    if (lessonId) {
      query.lesson = lessonId
    } else if (courseId) {
      query.course = courseId
    }

    const bookmarks = await Bookmark.find(query)
      .populate('lesson', 'title')
      .sort({ timestamp: 1 })

    return NextResponse.json({
      success: true,
      bookmarks,
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - إضافة علامة مرجعية
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, courseId, timestamp, title, note, color } = body

    if (!lessonId || !courseId || timestamp === undefined || !title) {
      return NextResponse.json({ success: false, message: 'بيانات ناقصة' }, { status: 400 })
    }

    // التحقق من عدم وجود علامة في نفس الوقت (±2 ثانية)
    const existingBookmark = await Bookmark.findOne({
      user: decoded.userId,
      lesson: lessonId,
      timestamp: { $gte: timestamp - 2, $lte: timestamp + 2 },
    })

    if (existingBookmark) {
      return NextResponse.json({ 
        success: false, 
        message: 'توجد علامة مرجعية قريبة من هذا الوقت' 
      }, { status: 400 })
    }

    const bookmark = await Bookmark.create({
      user: decoded.userId,
      lesson: lessonId,
      course: courseId,
      timestamp,
      title,
      note: note || '',
      color: color || 'yellow',
    })

    return NextResponse.json({
      success: true,
      bookmark,
    })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - حذف علامة مرجعية
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('id')

    if (!bookmarkId) {
      return NextResponse.json({ success: false, message: 'معرف العلامة مطلوب' }, { status: 400 })
    }

    const bookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      user: decoded.userId,
    })

    if (!bookmark) {
      return NextResponse.json({ success: false, message: 'العلامة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف العلامة',
    })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
