'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileQuestion,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Search,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Quiz {
  _id: string
  title: string
  description: string
  lesson?: {
    _id: string
    title: string
  }
  course?: {
    _id: string
    title: string
  }
  questions: any[]
  passingScore: number
  timeLimit?: number
  maxAttempts?: number
  isPublished: boolean
  createdAt: string
}

export default function AdminQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
    passingScore: 70,
    timeLimit: 30,
    maxAttempts: 3,
    isPublished: false,
  })

  useEffect(() => {
    checkAuth()
    loadQuizzes()
    loadCourses()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success || data.user.role !== 'admin') {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quizzes', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const data = await response.json()

      console.log('📊 بيانات الاختبارات:', data)
      console.log('📝 عدد الاختبارات:', data.quizzes?.length || 0)

      if (data.success) {
        setQuizzes(data.quizzes || [])
      } else {
        console.error('❌ فشل في تحميل الاختبارات:', data.message)
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الاختبارات:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const loadLessons = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      const data = await response.json()

      if (data.success) {
        setLessons(data.lessons || [])
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const openModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz)
      setFormData({
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.course?._id || '',
        lessonId: quiz.lesson?._id || '',
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit || 30,
        maxAttempts: quiz.maxAttempts || 3,
        isPublished: quiz.isPublished,
      })
      if (quiz.course?._id) {
        loadLessons(quiz.course._id)
      }
    } else {
      setEditingQuiz(null)
      setFormData({
        title: '',
        description: '',
        courseId: '',
        lessonId: '',
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
        isPublished: false,
      })
      setLessons([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingQuiz(null)
    setFormData({
      title: '',
      description: '',
      courseId: '',
      lessonId: '',
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
      isPublished: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.courseId) {
      alert('الرجاء ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const url = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : '/api/quizzes'
      const method = editingQuiz ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          course: formData.courseId,
          lesson: formData.lessonId || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadQuizzes()
        closeModal()
        alert(editingQuiz ? 'تم تحديث الاختبار بنجاح' : 'تم إنشاء الاختبار بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      alert('حدث خطأ أثناء حفظ الاختبار')
    }
  }

  const handleDelete = async (quizId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await loadQuizzes()
        alert('تم حذف الاختبار بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('حدث خطأ أثناء حذف الاختبار')
    }
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout title="إدارة الاختبارات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الاختبارات">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الاختبارات</h1>
              <p className="text-gray-600">إنشاء وإدارة اختبارات الدورات</p>
            </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة اختبار</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن اختبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileQuestion className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-gray-600">إجمالي الاختبارات</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{quizzes.length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-600">منشورة</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {quizzes.filter((q) => q.isPublished).length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-600">مسودات</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {quizzes.filter((q) => !q.isPublished).length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-600">متوسط الأسئلة</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {quizzes.length > 0
              ? Math.round(
                  quizzes.reduce((sum, q) => sum + q.questions.length, 0) / quizzes.length
                )
              : 0}
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredQuizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">العنوان</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">الدورة</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">الأسئلة</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">النجاح</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">الوقت</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">الحالة</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-900">{quiz.title}</div>
                        {quiz.lesson && (
                          <div className="text-sm text-gray-600">{quiz.lesson.title}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{quiz.course?.title || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {quiz.questions.length} سؤال
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{quiz.passingScore}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.timeLimit || '-'} دقيقة</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          quiz.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {quiz.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/admin/quizzes/${quiz._id}`}>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => openModal(quiz)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">لا توجد اختبارات</p>
            <p className="text-sm">ابدأ بإنشاء أول اختبار</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuiz ? 'تعديل الاختبار' : 'إضافة اختبار جديد'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    عنوان الاختبار *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الدورة *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => {
                      setFormData({ ...formData, courseId: e.target.value, lessonId: '' })
                      loadLessons(e.target.value)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    required
                  >
                    <option value="">اختر الدورة</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {lessons.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      الدرس (اختياري)
                    </label>
                    <select
                      value={formData.lessonId}
                      onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="">اختبار عام للدورة</option>
                      {lessons.map((lesson) => (
                        <option key={lesson._id} value={lesson._id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      درجة النجاح (%)
                    </label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) =>
                        setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      الوقت (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      عدد المحاولات
                    </label>
                    <input
                      type="number"
                      value={formData.maxAttempts}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
                  />
                  <label htmlFor="isPublished" className="text-sm font-semibold text-gray-900">
                    نشر الاختبار (متاح للطلاب)
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  {editingQuiz ? 'تحديث' : 'إنشاء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
