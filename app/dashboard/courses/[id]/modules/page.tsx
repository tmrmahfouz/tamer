'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { 
  Plus, Edit2, Trash2, Video, FileText, 
  ChevronDown, ChevronUp, Save, X, FileQuestion, MoreVertical, Eye 
} from 'lucide-react'
import Link from 'next/link'

export default function CourseModulesPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingModule, setEditingModule] = useState<any>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order: 0,
    duration: '',
    published: true,
  })

  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    order: 0,
    isFree: false,
    isPublished: true,
    content: {
      videoUrl: '',
      videoProvider: 'youtube',
    },
  })

  useEffect(() => {
    checkAuth()
    loadCourse()
    loadModules()
  }, [courseId])

  // Auto-expand all modules
  useEffect(() => {
    if (modules.length > 0) {
      const allModuleIds = new Set(modules.map(m => m._id))
      setExpandedModules(allModuleIds)
    }
  }, [modules])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          if (data.user.role !== 'admin' && data.user.role !== 'instructor') {
            router.push('/dashboard')
            return
          }
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      const data = await response.json()
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  const loadModules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/modules?courseId=${courseId}`)
      const data = await response.json()

      if (data.success) {
        // Load lessons for each module
        const modulesWithLessons = await Promise.all(
          data.modules.map(async (module: any) => {
            const lessonsResponse = await fetch(`/api/lessons?moduleId=${module._id}`)
            const lessonsData = await lessonsResponse.json()
            return {
              ...module,
              lessons: lessonsData.success ? lessonsData.lessons : [],
            }
          })
        )
        setModules(modulesWithLessons)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingModule
        ? `/api/modules/${editingModule._id}`
        : '/api/modules'

      const response = await fetch(url, {
        method: editingModule ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...moduleFormData,
          course: courseId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        setShowModuleModal(false)
        setEditingModule(null)
        setModuleFormData({
          title: '',
          description: '',
          order: 0,
          duration: '',
          published: true,
        })
        loadModules()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error saving module:', error)
      alert('حدث خطأ أثناء حفظ الوحدة')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        loadModules()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('حدث خطأ أثناء حذف الوحدة')
    }
  }

  const toggleModuleExpand = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  if (loading) {
    return (
      <AdminLayout title="محتوى الدورة">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={course?.title || 'محتوى الدورة'}>
      <div>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                محتوى الدورة
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {course?.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Link
                href={`/courses/${courseId}`}
                target="_blank"
                className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold border border-green-200 text-sm md:text-base"
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                <span>معاينة</span>
              </Link>
              <button
                onClick={() => router.push(`/dashboard/admin/quizzes?courseId=${courseId}`)}
                className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm md:text-base"
              >
                <FileQuestion className="w-4 h-4 md:w-5 md:h-5" />
                <span>الاختبارات</span>
              </button>
            </div>
          </div>
        </div>

          {/* Modules List */}
          <div className="space-y-2">
            {modules.map((module, index) => (
              <div
                key={module._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Module Header - Collapsible */}
                <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                  <button
                    onClick={() => toggleModuleExpand(module._id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    {expandedModules.has(module._id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600 transform rotate-180" />
                    )}
                    <span className="font-bold text-gray-900 text-lg">
                      {module.title}
                    </span>
                    {module.description && (
                      <span className="text-sm text-gray-500">
                        ({module.description})
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedModuleId(module._id)
                        setLessonFormData({
                          title: '',
                          description: '',
                          type: 'video',
                          order: module.lessons?.length || 0,
                          isFree: false,
                          isPublished: true,
                          content: {
                            videoUrl: '',
                            videoProvider: 'youtube',
                          },
                        })
                        setShowLessonModal(true)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <div className="relative group">
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingModule(module)
                            setModuleFormData({
                              title: module.title,
                              description: module.description || '',
                              order: module.order,
                              duration: module.duration || '',
                              published: module.published,
                            })
                            setShowModuleModal(true)
                          }}
                          className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteModule(module._id)
                          }}
                          className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons List - Shown when expanded */}
                {expandedModules.has(module._id) && (
                  <div className="bg-white">
                    {module.lessons && module.lessons.length > 0 && (
                      <div>
                        {module.lessons.map((lesson: any, lessonIndex: number) => (
                          <div
                            key={lesson._id}
                            className="p-4 pl-12 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-600" />}
                              {lesson.type === 'pdf' && <FileText className="w-4 h-4 text-gray-600" />}
                              <span className="text-gray-900">{lesson.title}</span>
                              {lesson.isFree && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  مجاني
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Video className="w-4 h-4 text-gray-600" />
                              </button>
                              <div className="relative group">
                                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                                <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/lessons/${lesson._id}/edit`)
                                    }}
                                    className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                    <span>تعديل</span>
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>حذف</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Lesson Button */}
                    <button
                      onClick={() => {
                        setSelectedModuleId(module._id)
                        setLessonFormData({
                          title: '',
                          description: '',
                          type: 'video',
                          order: module.lessons?.length || 0,
                          isFree: false,
                          isPublished: true,
                          content: {
                            videoUrl: '',
                            videoProvider: 'youtube',
                          },
                        })
                        setShowLessonModal(true)
                      }}
                      className="w-full p-4 pl-12 flex items-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors border-t border-dashed border-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">إضافة محتوى جديد</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Module Button */}
            <button
              onClick={() => {
                setEditingModule(null)
                setModuleFormData({
                  title: '',
                  description: '',
                  order: modules.length,
                  duration: '',
                  published: true,
                })
                setShowModuleModal(true)
              }}
              className="w-full p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">إضافة قسم جديد</span>
            </button>
          </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingModule ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setShowModuleModal(false)
                  setEditingModule(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModuleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  عنوان الوحدة *
                </label>
                <input
                  type="text"
                  value={moduleFormData.title}
                  onChange={(e) =>
                    setModuleFormData({ ...moduleFormData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="مثال: مقدمة في البرمجة"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={moduleFormData.description}
                  onChange={(e) =>
                    setModuleFormData({ ...moduleFormData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="وصف مختصر للوحدة..."
                />
              </div>

              {/* Duration & Order */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المدة
                  </label>
                  <input
                    type="text"
                    value={moduleFormData.duration}
                    onChange={(e) =>
                      setModuleFormData({ ...moduleFormData, duration: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="مثال: ساعتان"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={moduleFormData.order}
                    onChange={(e) =>
                      setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="modulePublished"
                  checked={moduleFormData.published}
                  onChange={(e) =>
                    setModuleFormData({ ...moduleFormData, published: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="modulePublished" className="text-sm font-semibold text-gray-700">
                  نشر الوحدة (إظهارها للطلاب)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModuleModal(false)
                    setEditingModule(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingModule ? 'حفظ التعديلات' : 'إضافة الوحدة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal - Redirect to lesson creation page */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              إضافة درس جديد
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم توجيهك إلى صفحة إنشاء الدرس
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLessonModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  router.push(`/dashboard/courses/${courseId}/lessons/new?moduleId=${selectedModuleId}`)
                }}
                className="flex-1 btn-primary"
              >
                متابعة
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
