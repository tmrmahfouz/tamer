'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileQuestion, Plus, Edit, Trash2, Eye, CheckCircle, Clock, BookOpen, Award, Search, Loader2
} from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

interface Quiz {
  _id: string
  title: string
  description: string
  lesson?: { _id: string; title: string }
  course?: { _id: string; title: string }
  questions: any[]
  passingScore: number
  timeLimit?: number
  maxAttempts?: number
  isPublished: boolean
  createdAt: string
}

export default function InstructorQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', courseId: '', lessonId: '', passingScore: 70, timeLimit: 30, maxAttempts: 3, isPublished: false
  })

  useEffect(() => {
    loadQuizzes()
    loadCourses()
  }, [])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quizzes?myQuizzes=true')
      const data = await response.json()
      if (data.success) setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/instructor/courses')
      const data = await response.json()
      if (data.success) setCourses(data.courses || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const loadLessons = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      const data = await response.json()
      if (data.success) setLessons(data.lessons || [])
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const openModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz)
      setFormData({
        title: quiz.title, description: quiz.description, courseId: quiz.course?._id || '', lessonId: quiz.lesson?._id || '',
        passingScore: quiz.passingScore, timeLimit: quiz.timeLimit || 30, maxAttempts: quiz.maxAttempts || 3, isPublished: quiz.isPublished
      })
      if (quiz.course?._id) loadLessons(quiz.course._id)
    } else {
      setEditingQuiz(null)
      setFormData({ title: '', description: '', courseId: '', lessonId: '', passingScore: 70, timeLimit: 30, maxAttempts: 3, isPublished: false })
      setLessons([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingQuiz(null)
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
        body: JSON.stringify({ ...formData, course: formData.courseId, lesson: formData.lessonId || undefined })
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
      alert('حدث خطأ أثناء حفظ الاختبار')
    }
  }

  const handleDelete = async (quizId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        await loadQuizzes()
        alert('تم حذف الاختبار بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء حذف الاختبار')
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <InstructorLayout title="إدارة الاختبارات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="إدارة الاختبارات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الاختبارات</h1>
            <p className="text-gray-600">إنشاء وإدارة اختبارات دوراتك</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-5 h-5" />
            إضافة اختبار
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="ابحث عن اختبار..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <FileQuestion className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">إجمالي الاختبارات</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{quizzes.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">منشورة</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.isPublished).length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
              <span className="text-sm text-gray-600">مسودات</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{quizzes.filter(q => !q.isPublished).length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-600">متوسط الأسئلة</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.questions.length, 0) / quizzes.length) : 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {filteredQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">العنوان</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الدورة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الأسئلة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">النجاح</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الوقت</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuizzes.map(quiz => (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{quiz.title}</div>
                        {quiz.lesson && <div className="text-sm text-gray-600">{quiz.lesson.title}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{quiz.course?.title || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{quiz.questions.length} سؤال</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{quiz.passingScore}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.timeLimit || '-'} دقيقة</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${quiz.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {quiz.isPublished ? 'منشور' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/instructor/quizzes/${quiz._id}`}>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="عرض"><Eye className="w-4 h-4" /></button>
                          </Link>
                          <button onClick={() => openModal(quiz)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="تعديل"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(quiz._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">{editingQuiz ? 'تعديل الاختبار' : 'إضافة اختبار جديد'}</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">عنوان الاختبار *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">الوصف</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">الدورة *</label>
                  <select value={formData.courseId} onChange={(e) => { setFormData({ ...formData, courseId: e.target.value, lessonId: '' }); loadLessons(e.target.value) }} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required>
                    <option value="">اختر الدورة</option>
                    {courses.map(course => <option key={course._id} value={course._id}>{course.title}</option>)}
                  </select>
                </div>

                {formData.courseId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الدرس (اختياري)</label>
                    <select value={formData.lessonId} onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                      <option value="">اختبار عام للدورة</option>
                      {lessons.length > 0 ? (
                        lessons.map(lesson => <option key={lesson._id} value={lesson._id}>{lesson.title}</option>)
                      ) : (
                        <option disabled>لا توجد دروس في هذه الدورة</option>
                      )}
                    </select>
                    {lessons.length === 0 && formData.courseId && (
                      <p className="text-xs text-gray-500 mt-1">لم يتم العثور على دروس. يمكنك إنشاء اختبار عام للدورة.</p>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">درجة النجاح (%)</label>
                    <input type="number" value={formData.passingScore} onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الوقت (دقيقة)</label>
                    <input type="number" value={formData.timeLimit} onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">عدد المحاولات</label>
                    <input type="number" value={formData.maxAttempts} onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-5 h-5 text-green-600 rounded" />
                  <label htmlFor="isPublished" className="text-sm font-semibold text-gray-900">نشر الاختبار</label>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">إلغاء</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingQuiz ? 'تحديث' : 'إنشاء'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
