import connectDB from './mongodb'
import Achievement from '@/models/Achievement'
import UserStats, { IUserStats } from '@/models/UserStats'
import { createNotification } from './notifications'

// تعريف جميع الشارات
export const ACHIEVEMENTS = {
  first_lesson: {
    title: '🎯 البداية القوية',
    description: 'أكملت أول درس',
    icon: '🎯',
    points: 50,
  },
  first_course: {
    title: '🏆 البطل',
    description: 'أكملت أول دورة كاملة',
    icon: '🏆',
    points: 500,
  },
  streak_7: {
    title: '🔥 النار المشتعلة',
    description: '7 أيام متتالية من التعلم',
    icon: '🔥',
    points: 200,
  },
  streak_30: {
    title: '⚡ الإصرار الحديدي',
    description: '30 يوم متتالي من التعلم',
    icon: '⚡',
    points: 1000,
  },
  lessons_10: {
    title: '📚 المتعلم النشط',
    description: 'أكملت 10 دروس',
    icon: '📚',
    points: 100,
  },
  lessons_50: {
    title: '🌟 النجم الساطع',
    description: 'أكملت 50 درس',
    icon: '🌟',
    points: 500,
  },
  courses_5: {
    title: '💎 الماسة',
    description: 'أكملت 5 دورات',
    icon: '💎',
    points: 2000,
  },
  courses_10: {
    title: '👑 الأسطورة',
    description: 'أكملت 10 دورات',
    icon: '👑',
    points: 5000,
  },
  perfect_quiz: {
    title: '💯 الكمال',
    description: 'حصلت على 100% في اختبار',
    icon: '💯',
    points: 150,
  },
  helper_10: {
    title: '💬 المساعد',
    description: 'أجبت على 10 أسئلة',
    icon: '💬',
    points: 250,
  },
  helper_50: {
    title: '🎓 الخبير',
    description: 'أجبت على 50 سؤال',
    icon: '🎓',
    points: 1000,
  },
  notes_50: {
    title: '📝 الكاتب',
    description: 'كتبت 50 ملاحظة',
    icon: '📝',
    points: 200,
  },
  notes_100: {
    title: '✍️ المؤلف',
    description: 'كتبت 100 ملاحظة',
    icon: '✍️',
    points: 500,
  },
  speed_demon: {
    title: '⚡ السريع',
    description: 'أكملت دورة في أسبوع',
    icon: '⚡',
    points: 300,
  },
  five_stars: {
    title: '⭐ النجم الذهبي',
    description: 'حصلت على 5 نجوم في 3 دورات',
    icon: '⭐',
    points: 400,
  },
}

// التحقق من الإنجاز ومنحه
export async function checkAndGrantAchievement(
  userId: string,
  achievementType: keyof typeof ACHIEVEMENTS
) {
  try {
    await connectDB()

    // التحقق إذا كان المستخدم حصل على الإنجاز مسبقاً
    const existing = await Achievement.findOne({
      user: userId,
      type: achievementType,
    })

    if (existing) {
      return { success: false, message: 'Already unlocked' }
    }

    const achievementData = ACHIEVEMENTS[achievementType]

    // منح الإنجاز
    const achievement = await Achievement.create({
      user: userId,
      type: achievementType,
      title: achievementData.title,
      description: achievementData.description,
      icon: achievementData.icon,
      points: achievementData.points,
    })

    // تحديث النقاط
    await UserStats.findOneAndUpdate(
      { user: userId },
      { $inc: { totalPoints: achievementData.points } },
      { upsert: true }
    )

    // إرسال إشعار
    await createNotification({
      userId,
      type: 'system',
      title: `🎉 إنجاز جديد: ${achievementData.title}`,
      message: `مبروك! حصلت على ${achievementData.points} نقطة`,
      link: '/profile',
    })

    return { success: true, achievement }
  } catch (error) {
    console.error('Grant achievement error:', error)
    return { success: false, error }
  }
}

// تحديث إحصائيات المستخدم
export async function updateUserStats(
  userId: string,
  updates: Partial<IUserStats>
) {
  try {
    await connectDB()

    const stats = await UserStats.findOneAndUpdate(
      { user: userId },
      { $inc: updates, lastActivityDate: new Date() },
      { upsert: true, new: true }
    )

    // التحقق من الإنجازات بناءً على الإحصائيات
    await checkAchievementsBasedOnStats(userId, stats)

    return { success: true, stats }
  } catch (error) {
    console.error('Update stats error:', error)
    return { success: false, error }
  }
}

// التحقق من الإنجازات بناءً على الإحصائيات
async function checkAchievementsBasedOnStats(userId: string, stats: any) {
  // الدروس
  if (stats.lessonsCompleted === 1) {
    await checkAndGrantAchievement(userId, 'first_lesson')
  }
  if (stats.lessonsCompleted === 10) {
    await checkAndGrantAchievement(userId, 'lessons_10')
  }
  if (stats.lessonsCompleted === 50) {
    await checkAndGrantAchievement(userId, 'lessons_50')
  }

  // الدورات
  if (stats.coursesCompleted === 1) {
    await checkAndGrantAchievement(userId, 'first_course')
  }
  if (stats.coursesCompleted === 5) {
    await checkAndGrantAchievement(userId, 'courses_5')
  }
  if (stats.coursesCompleted === 10) {
    await checkAndGrantAchievement(userId, 'courses_10')
  }

  // المساعدة
  if (stats.answersGiven === 10) {
    await checkAndGrantAchievement(userId, 'helper_10')
  }
  if (stats.answersGiven === 50) {
    await checkAndGrantAchievement(userId, 'helper_50')
  }

  // الملاحظات
  if (stats.notesCreated === 50) {
    await checkAndGrantAchievement(userId, 'notes_50')
  }
  if (stats.notesCreated === 100) {
    await checkAndGrantAchievement(userId, 'notes_100')
  }

  // Streak
  if (stats.currentStreak === 7) {
    await checkAndGrantAchievement(userId, 'streak_7')
  }
  if (stats.currentStreak === 30) {
    await checkAndGrantAchievement(userId, 'streak_30')
  }
}

// تحديث Streak
export async function updateStreak(userId: string) {
  try {
    await connectDB()

    const stats = await UserStats.findOne({ user: userId })
    if (!stats) {
      await UserStats.create({ user: userId, currentStreak: 1, longestStreak: 1 })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActivity = new Date(stats.lastActivityDate)
    lastActivity.setHours(0, 0, 0, 0)

    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      // نفس اليوم
      return
    } else if (diffDays === 1) {
      // يوم متتالي
      stats.currentStreak++
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak
      }
    } else {
      // انقطع الـ Streak
      stats.currentStreak = 1
    }

    stats.lastActivityDate = new Date()
    await stats.save()

    await checkAchievementsBasedOnStats(userId, stats)
  } catch (error) {
    console.error('Update streak error:', error)
  }
}
