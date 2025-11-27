// دالة مساعدة لإنشاء الإشعارات
import connectDB from './mongodb'
import Notification from '@/models/Notification'

interface CreateNotificationParams {
  userId: string
  type: 'course' | 'lesson' | 'review' | 'certificate' | 'coupon' | 'system'
  title: string
  message: string
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB()

    const notification = await Notification.create({
      user: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Create notification error:', error)
    return { success: false, error }
  }
}

// دوال جاهزة لإشعارات شائعة
export async function notifyNewLesson(userId: string, courseTitle: string, lessonTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: 'lesson',
    title: 'درس جديد متاح',
    message: `تم إضافة درس جديد "${lessonTitle}" في دورة "${courseTitle}"`,
    link: `/courses/${courseId}`,
  })
}

export async function notifyReviewReply(userId: string, courseTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: 'review',
    title: 'رد على تقييمك',
    message: `تم الرد على تقييمك في دورة "${courseTitle}"`,
    link: `/courses/${courseId}`,
  })
}

export async function notifyCertificateReady(userId: string, courseTitle: string, certificateId: string) {
  return createNotification({
    userId,
    type: 'certificate',
    title: 'شهادتك جاهزة! 🎉',
    message: `تهانينا! شهادتك في دورة "${courseTitle}" جاهزة للتحميل`,
    link: `/certificates/${certificateId}`,
  })
}

export async function notifyNewCoupon(userId: string, discount: number, code: string) {
  return createNotification({
    userId,
    type: 'coupon',
    title: 'كوبون خصم جديد! 🎫',
    message: `احصل على خصم ${discount}% باستخدام الكود: ${code}`,
    link: '/courses',
  })
}

export async function notifyEnrollmentSuccess(userId: string, courseTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: 'course',
    title: 'تم التسجيل بنجاح',
    message: `تم تسجيلك في دورة "${courseTitle}". ابدأ التعلم الآن!`,
    link: `/learn/${courseId}`,
  })
}
