import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import VideoProgress from '@/models/VideoProgress'
import Progress from '@/models/Progress'
import Lesson from '@/models/Lesson'
import { verifyToken } from '@/lib/jwt'

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
    const courseId = searchParams.get('courseId')

    // Build query
    const query: any = { user: decoded.userId }
    if (courseId) {
      query.course = courseId
    }

    // Get video progress for watch time
    const videoProgressList = await VideoProgress.find(query)
    
    // Calculate total watch time (in minutes)
    const totalWatchTime = videoProgressList.reduce((total, vp) => {
      return total + (vp.watchedSeconds / 60)
    }, 0)

    // Get lesson progress
    const progressList = await Progress.find(query)
    const lessonsCompleted = progressList.filter(p => p.completed).length

    // Get total lessons count
    let totalLessons = 0
    if (courseId) {
      totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true })
    } else {
      // Get unique courses from progress
      const courseIds = [...new Set(progressList.map(p => p.course.toString()))]
      for (const cId of courseIds) {
        const count = await Lesson.countDocuments({ course: cId, isPublished: true })
        totalLessons += count
      }
    }

    // Calculate streak (days in a row with activity)
    const activityDates = [...videoProgressList, ...progressList]
      .map(p => new Date(p.updatedAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < activityDates.length; i++) {
      const activityDate = new Date(activityDates[i])
      activityDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (activityDate.getTime() === expectedDate.getTime()) {
        tempStreak++
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
        if (i === 0) {
          // No activity today, check yesterday
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          if (activityDate.getTime() === yesterday.getTime()) {
            tempStreak = 1
            currentStreak = 1
          } else {
            tempStreak = 0
          }
        } else {
          tempStreak = 0
        }
      }
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }

    // Calculate weekly progress (minutes per day for last 7 days)
    const weeklyProgress: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayProgress = videoProgressList.filter(vp => {
        const vpDate = new Date(vp.updatedAt)
        return vpDate >= date && vpDate < nextDate
      })

      const dayMinutes = dayProgress.reduce((total, vp) => total + (vp.watchedSeconds / 60), 0)
      weeklyProgress.push(Math.round(dayMinutes))
    }

    // Average session time
    const sessionsCount = videoProgressList.length || 1
    const averageSessionTime = totalWatchTime / sessionsCount

    // Last study date
    const lastActivity = [...videoProgressList, ...progressList]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    const lastStudyDate = lastActivity ? lastActivity.updatedAt : null

    return NextResponse.json({
      success: true,
      stats: {
        totalWatchTime: Math.round(totalWatchTime),
        lessonsCompleted,
        totalLessons,
        currentStreak,
        longestStreak,
        averageSessionTime: Math.round(averageSessionTime),
        lastStudyDate,
        weeklyProgress,
      },
    })
  } catch (error) {
    console.error('Error fetching learning stats:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
