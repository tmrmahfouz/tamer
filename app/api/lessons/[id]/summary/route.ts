import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'

// نموذج بسيط لتخزين الملخصات - يمكن توسيعه لاحقاً
interface LessonSummaryData {
  summary: string
  keyPoints: string[]
}

// GET - جلب ملخص الدرس
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const lesson = await Lesson.findById(params.id)
    
    if (!lesson) {
      return NextResponse.json({ success: false, message: 'الدرس غير موجود' }, { status: 404 })
    }

    // إذا كان الدرس يحتوي على ملخص مخزن
    // يمكن إضافة حقل summary و keyPoints في نموذج Lesson
    // أو إنشاء نموذج منفصل للملخصات
    
    // حالياً نرجع بيانات فارغة - يمكن ملؤها من لوحة التحكم
    const summaryData = {
      summary: lesson.summary || null,
      keyPoints: lesson.keyPoints || [],
    }

    return NextResponse.json({
      success: true,
      ...summaryData,
    })
  } catch (error) {
    console.error('Error fetching lesson summary:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
