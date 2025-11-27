'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileQuestion,
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Clock,
  Award,
  Eye,
  EyeOff,
  ChevronLeft,
} from 'lucide-react'

interface Quiz {
  _id: string
  title: string
  description: string
  course: { _id: string; title: string }
  lesson?: { _id: string; title: string }
  questions: any[]
  passingScore: number
  timeLimit?: number
  maxAttempts: number
  isPublished: boolean
  createdAt: string
}

export default function TeacherQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    lesson: '',
    passingScore: 70,
    timeLimit: 0,
    maxAttempts: 3,
    isPublished: false,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success) {
        router.push('/login')
        return
      }

      // السماح للمعلم والأدمن
      if (data.user.role !== 'instructor' && data.user.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      loadQuizzes()
      loadCourses()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadQuizzes = async () => {
    try {
      // جلب اختبارات المعلم فقط
      const response = await fetch('/api/quizzes?myQuizzes=true')
      const data = await response.json()
      if (data.success) {
        setQuizzes(data.quizzes)
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      // جلب دورات المعلم فقط
      const response = await fetch('/api/courses?myCourses=true')
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const loadLessons = async (courseId: string) => {
    if (!courseId) {
      setLessons([])
      return
    }
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const handleCourseChange = (courseId: string) => {
    setFormData({ ...formData, course: courseId, lesson: '' })
    loadLessons(courseId)
  }

  const openModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz)
      setFormData({
        title: quiz.title,
        description: quiz.description,
        course: quiz.course._id,
        lesson: quiz.lesson?._id || '',
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit || 0,
        maxAttempts: quiz.maxAttempts,
        isPublished: quiz.isPublished,
      })
      if (quiz.course._id) {
        loadLessons(quiz.course._id)
      }
    } else {
      setEditingQuiz(null)
      setFormData({
        title: '',
        description: '',
        course: '',
        lesson: '',
        passingScore: 70,
        timeLimit: 0,
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
      course: '',
      lesson: '',
      passingScore: 70,
      timeLimit: 0,
      maxAttempts: 3,
      isPublished: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.course) {
      alert('الرجاء إدخال العنوان واختيار الدورة')
      return
    }

    try {
      const url = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : '/api/quizzes'
      const method = editingQuiz ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        loadQuizzes()
        closeModal()
        alert(editingQuiz ? 'تم تحديث الاختبار بنجاح' : 'تم إنشاء الاختبار بنجاح')
        
        // الانتقال لصفحة إضافة الأسئلة
        if (!editingQuiz && data.quiz?._id) {
          router.push(`/dashboard/quizzes/${data.quiz._id}`)
        }
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      alert('حدث خطأ أثناء الحفظ')
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
        setQuizzes(quizzes.filter((q) => q._id !== quizId))
        alert('تم حذف الاختبار بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const togglePublish = async (quiz: Quiz) => {
    try {
      const response = await fetch(`/api/quizzes/${quiz._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      })

      const data = await response.json()

      if (data.success) {
        loadQuizzes()
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = !filterCourse || quiz.course._id === filterCourse
    return matchesSearch && matchesCourse
  })

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
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              الدورات
            </Link>
            <Link
              href="/dashboard/quizzes"
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-semibold"
            >
              <FileQuestion className="w-5 h-5" />
              الاختبارات
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الاختبارات</h1>
              <p className="text-gray-600">إنشاء وإدارة اختبارات الدورات</p>
            </div>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إنشاء اختبار
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث عن اختبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="">جميع الدورات</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quizzes Grid */}
          {filteredQuizzes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileQuestion className="w-6 h-6 text-purple-600" />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          quiz.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {quiz.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {quiz.description || 'لا يوجد وصف'}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.course?.title || 'غير محدد'}</span>
                      </div>
                      {quiz.lesson && (
                        <div className="flex items-center gap-2 text-purple-600">
                          <ChevronLeft className="w-4 h-4" />
                          <span>{quiz.lesson.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{quiz.questions?.length || 0} سؤال</span>
                      </div>
                      {quiz.timeLimit && quiz.timeLimit > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.timeLimit} دقيقة</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Link
                        href={`/dashboard/quizzes/${quiz._id}`}
                        className="flex-1 py-2 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        إدارة الأسئلة
                      </Link>
                      <button
                        onClick={() => openModal(quiz)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => togglePublish(quiz)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={quiz.isPublished ? 'إلغاء النشر' : 'نشر'}
                      >
                        {quiz.isPublished ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FileQuestion className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد اختبارات</h3>
              <p className="text-gray-600 mb-6">ابدأ بإنشاء أول اختبار لدوراتك</p>
              <button onClick={() => openModal()} className="btn-primary">
                إنشاء اختبار جديد
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuiz ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  عنوان الاختبار *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="مثال: اختبار الوحدة الأولى"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                  rows={3}
                  placeholder="وصف مختصر للاختبار..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الدورة *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الدرس (اختياري)
                  </label>
                  <select
                    value={formData.lesson}
                    onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    disabled={!formData.course}
                  >
                    <option value="">اختبار عام للدورة</option>
                    {lessons.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    اختر درس لربط الاختبار به أو اتركه فارغاً لاختبار عام
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الوقت المحدد (دقيقة)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    min="0"
                    placeholder="0 = بدون حد"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
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
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="text-gray-900 font-semibold">
                  نشر الاختبار فوراً
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t">
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
                  {editingQuiz ? 'تحديث' : 'إنشاء الاختبار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
