'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  ArrowLeft,
} from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

export default function InstructorLessonsPage() {
  const params = useParams()
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'فيديو'
      case 'pdf':
        return 'PDF'
      case 'text':
        return 'نص'
      case 'html5':
        return 'HTML5'
      case 'quiz':
        return 'اختبار'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/instructor/courses"
            className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center gap-1 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للدورات
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
            إدارة دروس: {course?.title}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">أضف وعدّل دروس الدورة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">{lessons.length}</div>
            <div className="text-sm text-gray-600">إجمالي الدروس</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {lessons.filter(l => l.isPublished).length}
            </div>
            <div className="text-sm text-gray-600">دروس منشورة</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {lessons.filter(l => l.type === 'video').length}
            </div>
            <div className="text-sm text-gray-600">دروس فيديو</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {lessons.filter(l => l.isFree).length}
            </div>
            <div className="text-sm text-gray-600">دروس مجانية</div>
          </div>
        </div>

        {/* Add Lesson Button */}
        <div className="mb-6 flex gap-3">
          <Link
            href={`/instructor/courses/${params.id}/lessons/new`}
            className="btn-primary inline-flex items-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>إضافة درس جديد</span>
          </Link>
          <Link
            href={`/instructor/courses/${params.id}/edit`}
            className="btn-secondary inline-flex items-center gap-2 text-sm md:text-base"
          >
            <Edit className="w-4 h-4 md:w-5 md:h-5" />
            <span>تعديل الدورة</span>
          </Link>
        </div>

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد دروس بعد
            </h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة درسك الأول</p>
            <Link
              href={`/instructor/courses/${params.id}/lessons/new`}
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
                    className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 md:gap-4">
                      {/* Drag Handle */}
                      <div className="cursor-move text-gray-400 hidden md:block">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Order Number */}
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600 text-sm md:text-base flex-shrink-0">
                        {lesson.order || index + 1}
                      </div>

                      {/* Icon */}
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base truncate">
                          {lesson.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {getTypeLabel(lesson.type)}
                          </span>
                          {lesson.content?.duration && (
                            <span>{lesson.content.duration} دقيقة</span>
                          )}
                          {lesson.isFree && (
                            <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                              مجاني
                            </span>
                          )}
                          {lesson.isPublished ? (
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">منشور</span>
                          ) : (
                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">مسودة</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 md:gap-2 flex-shrink-0">
                        <Link
                          href={`/instructor/courses/${params.id}/lessons/${lesson._id}/edit`}
                          className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(lesson._id)}
                          className="p-1.5 md:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
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
    </InstructorLayout>
  )
}
