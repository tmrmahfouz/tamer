'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  Award,
  GripVertical,
} from 'lucide-react'

export default function ManageLessonsPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourse()
    loadLessons()
  }, [])

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  const loadLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      return
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setLessons(lessons.filter((l) => l._id !== lessonId))
        alert('تم حذف الدرس بنجاح')
      } else {
        alert(data.message || 'حدث خطأ أثناء حذف الدرس')
      }
    } catch (error) {
      alert('حدث خطأ أثناء حذف الدرس')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play
      case 'pdf':
        return FileText
      case 'quiz':
        return Award
      default:
        return BookOpen
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

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-semibold"
            >
              الدورات
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/courses"
              className="text-primary-600 hover:text-primary-700 mb-2 inline-block"
            >
              ← العودة للدورات
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة دروس: {course?.title}
            </h1>
            <p className="text-gray-600">أضف وعدّل دروس الدورة</p>
          </div>

          {/* Add Lesson Button */}
          <div className="mb-6">
            <Link
              href={`/dashboard/courses/${params.id}/lessons/new`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة درس جديد</span>
            </Link>
          </div>

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد دروس بعد
              </h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة درسك الأول</p>
              <Link
                href={`/dashboard/courses/${params.id}/lessons/new`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة درس</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y">
                {lessons.map((lesson, index) => {
                  const Icon = getIcon(lesson.type)
                  return (
                    <div
                      key={lesson._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div className="cursor-move text-gray-400">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Order Number */}
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600">
                          {index + 1}
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="capitalize">{lesson.type}</span>
                            {lesson.content?.duration && (
                              <span>{lesson.content.duration} دقيقة</span>
                            )}
                            {lesson.isFree && (
                              <span className="text-green-600 font-semibold">
                                مجاني
                              </span>
                            )}
                            {lesson.isPublished ? (
                              <span className="text-green-600">منشور</span>
                            ) : (
                              <span className="text-gray-500">مسودة</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/courses/${params.id}/lessons/${lesson._id}/edit`}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lesson._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
