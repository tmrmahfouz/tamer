import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import VideoProgress from '@/models/VideoProgress'
import { verifyToken } from '@/lib/jwt'

// GET - جلب تقدم الفيديو
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

    if (lessonId) {
      // جلب تقدم درس محدد
      const progress = await VideoProgress.findOne({
        user: decoded.userId,
        lesson: lessonId,
      })

      return NextResponse.json({
        success: true,
        progress: progress || null,
      })
    }

    if (courseId) {
      // جلب تقدم كل دروس الدورة
      const progressList = await VideoProgress.find({
        user: decoded.userId,
        course: courseId,
      }).sort({ updatedAt: -1 })

      return NextResponse.json({
        success: true,
        progressList,
      })
    }

    return NextResponse.json({ success: false, message: 'يجب تحديد lessonId أو courseId' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching video progress:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - تحديث تقدم الفيديو
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
    const { lessonId, courseId, currentTime, duration, playbackSpeed, completedSegments } = body

    if (!lessonId || !courseId) {
      return NextResponse.json({ success: false, message: 'بيانات ناقصة' }, { status: 400 })
    }

    // حساب نسبة المشاهدة من الأجزاء المكتملة
    let watchedSeconds = 0
    if (completedSegments && completedSegments.length > 0) {
      // دمج الأجزاء المتداخلة وحساب الإجمالي
      const merged = mergeSegments(completedSegments)
      watchedSeconds = merged.reduce((total: number, seg: number[]) => total + (seg[1] - seg[0]), 0)
    }

    const watchedPercentage = duration > 0 ? Math.min(100, (watchedSeconds / duration) * 100) : 0
    const isCompleted = watchedPercentage >= 90

    const progress = await VideoProgress.findOneAndUpdate(
      { user: decoded.userId, lesson: lessonId },
      {
        user: decoded.userId,
        lesson: lessonId,
        course: courseId,
        currentTime: currentTime || 0,
        duration: duration || 0,
        watchedSeconds,
        watchedPercentage,
        playbackSpeed: playbackSpeed || 1,
        lastPosition: currentTime || 0,
        completedSegments: completedSegments || [],
        isCompleted,
        lastWatchedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error('Error updating video progress:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// دمج الأجزاء المتداخلة
function mergeSegments(segments: number[][]): number[][] {
  if (!segments.length) return []
  
  const sorted = [...segments].sort((a, b) => a[0] - b[0])
  const merged: number[][] = [sorted[0]]
  
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const current = sorted[i]
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1])
    } else {
      merged.push(current)
    }
  }
  
  return merged
}
