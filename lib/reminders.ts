import connectDB from './mongodb'
import Reminder from '@/models/Reminder'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import Progress from '@/models/Progress'
import UserStats from '@/models/UserStats'
import { createNotification } from './notifications'

// إنشاء تذكير بموعد الواجب
export async function createAssignmentReminder(
  userId: string,
  assignmentId: string,
  dueDate: Date
) {
  try {
    await connectDB()

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) return { success: false }

    // تذكير قبل 24 ساعة
    const reminder24h = new Date(dueDate)
    reminder24h.setHours(reminder24h.getHours() - 24)

    if (reminder24h > new Date()) {
      await Reminder.create({
        user: userId,
        type: 'assignment',
        title: 'تذكير: موعد تسليم الواجب قريب',
        message: `لديك 24 ساعة لتسليم واجب "${assignment.title}"`,
        relatedId: assignmentId,
        relatedModel: 'Assignment',
        scheduledFor: reminder24h,
      })
    }

    // تذكير قبل 1 ساعة
    const reminder1h = new Date(dueDate)
    reminder1h.setHours(reminder1h.getHours() - 1)

    if (reminder1h > new Date()) {
      await Reminder.create({
        user: userId,
        type: 'assignment',
        title: 'تذكير عاجل: موعد تسليم الواجب',
        message: `لديك ساعة واحدة فقط لتسليم واجب "${assignment.title}"`,
        relatedId: assignmentId,
        relatedModel: 'Assignment',
        scheduledFor: reminder1h,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Create assignment reminder error:', error)
    return { success: false, error }
  }
}

// تذكير بإكمال الدورة
export async function createCourseCompletionReminder(
  userId: string,
  courseId: string
) {
  try {
    await connectDB()

    // تذكير بعد 7 أيام من آخر نشاط
    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate() + 7)

    await Reminder.create({
      user: userId,
      type: 'course_completion',
      title: 'أكمل دورتك!',
      message: 'لم نراك منذ فترة! عد وأكمل دورتك للحصول على الشهادة',
      relatedId: courseId,
      relatedModel: 'Course',
      scheduledFor: reminderDate,
    })

    return { success: true }
  } catch (error) {
    console.error('Create course reminder error:', error)
    return { success: false, error }
  }
}

// تذكير يومي للحفاظ على Streak
export async function createStreakReminder(userId: string) {
  try {
    await connectDB()

    const stats = await UserStats.findOne({ user: userId })
    if (!stats || stats.currentStreak === 0) return { success: false }

    // تذكير يومي في الساعة 8 مساءً
    const reminderDate = new Date()
    reminderDate.setHours(20, 0, 0, 0)

    if (reminderDate < new Date()) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }

    await Reminder.create({
      user: userId,
      type: 'streak',
      title: '🔥 حافظ على Streak الخاص بك!',
      message: `لديك ${stats.currentStreak} يوم متتالي! لا تفقد تقدمك، تعلم شيئاً جديداً اليوم`,
      scheduledFor: reminderDate,
    })

    return { success: true }
  } catch (error) {
    console.error('Create streak reminder error:', error)
    return { success: false, error }
  }
}

// معالجة التذكيرات المجدولة (يجب تشغيله دورياً كل دقيقة)
export async function processScheduledReminders() {
  try {
    await connectDB()

    const now = new Date()

    // جلب التذكيرات المستحقة
    const dueReminders = await Reminder.find({
      scheduledFor: { $lte: now },
      sent: false,
    }).limit(100)

    for (const reminder of dueReminders) {
      // إرسال إشعار
      await createNotification({
        userId: reminder.user.toString(),
        type: 'system',
        title: reminder.title,
        message: reminder.message,
        link: reminder.relatedId
          ? `/${reminder.relatedModel?.toLowerCase()}s/${reminder.relatedId}`
          : '/dashboard',
      })

      // تحديث حالة التذكير
      reminder.sent = true
      reminder.sentAt = new Date()
      await reminder.save()
    }

    return { success: true, processed: dueReminders.length }
  } catch (error) {
    console.error('Process reminders error:', error)
    return { success: false, error }
  }
}

// حذف التذكيرات القديمة (أكثر من 30 يوم)
export async function cleanupOldReminders() {
  try {
    await connectDB()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await Reminder.deleteMany({
      sent: true,
      sentAt: { $lt: thirtyDaysAgo },
    })

    return { success: true }
  } catch (error) {
    console.error('Cleanup reminders error:', error)
    return { success: false, error }
  }
}

// تذكير بالدروس غير المكتملة
export async function createIncompleteLessonsReminder(
  userId: string,
  courseId: string
) {
  try {
    await connectDB()

    // تذكير بعد 3 أيام من آخر نشاط
    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate() + 3)

    await Reminder.create({
      user: userId,
      type: 'lesson',
      title: 'لديك دروس لم تكملها',
      message: 'عد وأكمل دروسك للاستفادة القصوى من الدورة',
      relatedId: courseId,
      relatedModel: 'Course',
      scheduledFor: reminderDate,
    })

    return { success: true }
  } catch (error) {
    console.error('Create lesson reminder error:', error)
    return { success: false, error }
  }
}
