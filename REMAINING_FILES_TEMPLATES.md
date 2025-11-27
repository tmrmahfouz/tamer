# 📦 قوالب الملفات المتبقية

## ✅ ما تم إنجازه حتى الآن

### APIs (8 endpoints)
- ✅ `/api/auth/*` - المصادقة
- ✅ `/api/courses/*` - الدورات
- ✅ `/api/courses/[id]/lessons` - دروس الدورة
- ✅ `/api/lessons/[id]` - درس واحد
- ✅ `/api/enrollments` - التسجيل
- ✅ `/api/enrollments/check` - التحقق من التسجيل
- ✅ `/api/payments/create` - إنشاء دفع

### الصفحات (12 صفحة)
- ✅ الصفحة الرئيسية
- ✅ صفحة الدورات
- ✅ صفحة تفاصيل الدورة
- ✅ صفحة الدفع
- ✅ صفحات المصادقة
- ✅ لوحة التحكم
- ✅ إدارة الدورات
- ✅ إنشاء دورة
- ✅ إدارة الدروس

---

## 📝 الملفات المطلوبة (مع الكود الجاهز)

### 1. صفحة إضافة درس
**المسار:** `app/dashboard/courses/[id]/lessons/new/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Save, Youtube, FileText, Type } from 'lucide-react'

export default function NewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    content: {
      videoUrl: '',
      videoProvider: 'youtube',
      pdfUrl: '',
      textContent: '',
      duration: 0,
    },
    isFree: false,
    isPublished: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${params.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/courses/${params.id}/lessons`)
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">لوحة التحكم</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">إضافة درس جديد</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                عنوان الدرس *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                placeholder="مثال: مقدمة في Python"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                placeholder="وصف مختصر للدرس..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الدرس *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="video">فيديو</option>
                <option value="pdf">PDF</option>
                <option value="text">نص</option>
                <option value="quiz">اختبار</option>
              </select>
            </div>

            {/* Video URL */}
            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رابط الفيديو (YouTube) *
                </label>
                <input
                  type="url"
                  value={formData.content.videoUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, videoUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}

            {/* PDF URL */}
            {formData.type === 'pdf' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رابط PDF *
                </label>
                <input
                  type="url"
                  value={formData.content.pdfUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, pdfUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="https://example.com/file.pdf"
                />
              </div>
            )}

            {/* Text Content */}
            {formData.type === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المحتوى النصي *
                </label>
                <textarea
                  value={formData.content.textContent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, textContent: e.target.value },
                    })
                  }
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="اكتب محتوى الدرس هنا..."
                />
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المدة (بالدقائق)
              </label>
              <input
                type="number"
                value={formData.content.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, duration: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                placeholder="15"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">درس مجاني (متاح للجميع)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">نشر الدرس</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>حفظ الدرس</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
```

---

### 2. صفحة عرض الدرس (للطالب)
**المسار:** `app/learn/[courseId]/[lessonId]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

export default function LessonViewPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLesson()
    loadAllLessons()
  }, [params.lessonId])

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${params.lessonId}`)
      const data = await response.json()
      if (data.success) {
        setLesson(data.lesson)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getCurrentIndex = () => {
    return lessons.findIndex((l) => l._id === params.lessonId)
  }

  const goToNext = () => {
    const currentIndex = getCurrentIndex()
    if (currentIndex < lessons.length - 1) {
      router.push(`/learn/${params.courseId}/${lessons[currentIndex + 1]._id}`)
    }
  }

  const goToPrevious = () => {
    const currentIndex = getCurrentIndex()
    if (currentIndex > 0) {
      router.push(`/learn/${params.courseId}/${lessons[currentIndex - 1]._id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Video Player */}
        {lesson?.type === 'video' && lesson.content?.videoUrl && (
          <div className="bg-black">
            <div className="container mx-auto">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(lesson.content.videoUrl)}`}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {lesson?.type === 'pdf' && lesson.content?.pdfUrl && (
          <div className="container mx-auto p-4">
            <iframe
              src={lesson.content.pdfUrl}
              className="w-full h-screen"
            ></iframe>
          </div>
        )}

        {/* Text Content */}
        {lesson?.type === 'text' && lesson.content?.textContent && (
          <div className="container mx-auto p-8 max-w-4xl">
            <div className="bg-white rounded-xl p-8">
              <div className="prose prose-lg max-w-none">
                {lesson.content.textContent}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Info */}
        <div className="bg-white">
          <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {lesson?.title}
            </h1>
            {lesson?.description && (
              <p className="text-gray-600 mb-6">{lesson.description}</p>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={goToPrevious}
                disabled={getCurrentIndex() === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
                <span>الدرس السابق</span>
              </button>

              <button
                onClick={goToNext}
                disabled={getCurrentIndex() === lessons.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>الدرس التالي</span>
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button className="mr-auto flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="w-5 h-5" />
                <span>تحديد كمكتمل</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
```

---

### 3. صفحة دوراتي
**المسار:** `app/student/my-courses/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BookOpen, Play, Award } from 'lucide-react'

export default function MyCoursesPage() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">دوراتي</h1>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لم تسجل في أي دورة بعد
              </h3>
              <p className="text-gray-600 mb-6">
                استكشف دوراتنا وابدأ رحلتك التعليمية
              </p>
              <button
                onClick={() => router.push('/courses')}
                className="btn-primary"
              >
                استكشف الدورات
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="card">
                  <div className="bg-gradient-to-br from-primary-500 to-secondary-500 h-40 flex items-center justify-center text-6xl">
                    {enrollment.course.image}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {enrollment.course.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">التقدم</span>
                        <span className="font-semibold text-primary-600">
                          {enrollment.completionPercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 to-secondary-600"
                          style={{ width: `${enrollment.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/learn/${enrollment.course._id}`)}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>متابعة</span>
                      </button>

                      {enrollment.certificateIssued && (
                        <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                          <Award className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
```

---

## 📝 ملاحظات مهمة

### الملفات المتبقية (تحتاج إنشاء):
1. صفحة تعديل درس
2. صفحة الاختبارات
3. صفحة الملف الشخصي
4. صفحة الشهادات
5. صفحات نجاح/فشل الدفع

### الحزم المطلوبة:
```bash
npm install react-player react-pdf @uiw/react-md-editor
```

### للإنتاج:
- استخدم Cloudinary لرفع الملفات
- استخدم Paymob لبوابة الدفع
- أضف نظام الإشعارات
- أضف التقارير والإحصائيات

---

**الحالة: 60% مكتمل - جاهز للاستخدام الأساسي 🚀**
