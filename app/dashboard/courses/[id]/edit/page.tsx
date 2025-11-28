'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Save, List, Edit, Trash2, Eye, Video, FileText, CheckCircle, Clock, CalendarDays, Layers, Lock, Award } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lessons, setLessons] = useState<any[]>([])
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: '',
    order: 0,
    isFree: false,
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'البرمجة',
    level: 'مبتدئ',
    price: 0,
    duration: '',
    image: '🎓',
    topics: [''],
    published: false,
    // إعدادات المحتوى بالتنقيط
    dripEnabled: false,
    dripType: 'days' as 'days' | 'lessons' | 'date',
    dripInterval: 7,
    dripStartDate: '',
    // إجبار ترتيب الدروس
    enforceSequentialLessons: false,
    // الشهادات
    certificateEnabled: true,
  })

  const categories = ['البرمجة', 'الذكاء الاصطناعي', 'تحليل البيانات', 'تطوير التطبيقات', 'الأمن السيبراني']
  const levels = ['مبتدئ', 'متوسط', 'متقدم']

  useEffect(() => {
    loadCourse()
    loadLessons()
  }, [])

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()
      if (data.success) {
        const course = data.course
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category: course.category || 'البرمجة',
          level: course.level || 'مبتدئ',
          price: course.price || 0,
          duration: course.duration || '',
          image: course.image || '🎓',
          topics: course.topics && course.topics.length > 0 ? course.topics : [''],
          published: course.published || false,
          // إعدادات التنقيط
          dripEnabled: course.dripEnabled || false,
          dripType: course.dripType || 'days',
          dripInterval: course.dripInterval || 7,
          dripStartDate: course.dripStartDate ? new Date(course.dripStartDate).toISOString().split('T')[0] : '',
          // إجبار ترتيب الدروس
          enforceSequentialLessons: course.enforceSequentialLessons || false,
          // الشهادات
          certificateEnabled: course.certificateEnabled !== false, // مفعّل افتراضياً
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons || [])
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const openLessonModal = (lesson?: any) => {
    // Redirect to add/edit lesson page instead of modal
    if (lesson) {
      router.push(`/dashboard/courses/${params.id}/lessons/${lesson._id}/edit`)
    } else {
      router.push(`/dashboard/courses/${params.id}/lessons/new`)
    }
    return
    
    // Old modal code (disabled)
    /*
    if (lesson) {
      setEditingLesson(lesson)
      setLessonFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || '',
        order: lesson.order || 0,
        isFree: lesson.isFree || false,
      })
    } else {
      setEditingLesson(null)
      setLessonFormData({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        duration: '',
        order: lessons.length + 1,
        isFree: false,
      })
    }
    setShowLessonModal(true)
    */
  }

  const closeLessonModal = () => {
    setShowLessonModal(false)
    setEditingLesson(null)
    setLessonFormData({
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      duration: '',
      order: 0,
      isFree: false,
    })
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!lessonFormData.title) {
      alert('الرجاء إدخال عنوان الدرس')
      return
    }

    try {
      const url = editingLesson
        ? `/api/lessons/${editingLesson._id}`
        : `/api/courses/${params.id}/lessons`

      const response = await fetch(url, {
        method: editingLesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonFormData,
          course: params.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadLessons()
        closeLessonModal()
        alert(editingLesson ? 'تم تحديث الدرس بنجاح' : 'تم إضافة الدرس بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('حدث خطأ أثناء حفظ الدرس')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await loadLessons()
        alert('تم حذف الدرس بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('حدث خطأ أثناء حذف الدرس')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...formData.topics]
    newTopics[index] = value
    setFormData({ ...formData, topics: newTopics })
  }

  const addTopic = () => {
    setFormData({ ...formData, topics: [...formData.topics, ''] })
  }

  const removeTopic = (index: number) => {
    const newTopics = formData.topics.filter((_, i) => i !== index)
    setFormData({ ...formData, topics: newTopics })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!formData.title || !formData.description) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      setSaving(false)
      return
    }

    const filteredTopics = formData.topics.filter(t => t.trim() !== '')
    if (filteredTopics.length === 0) {
      setError('الرجاء إضافة موضوع واحد على الأقل')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topics: filteredTopics,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/dashboard/courses')
      } else {
        setError(data.message || 'حدث خطأ أثناء تحديث الدورة')
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="تعديل الدورة">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="تعديل الدورة">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <Link href="/dashboard/courses" className="text-primary-600 hover:text-primary-700 mb-2 inline-block text-sm md:text-base">
            ← العودة للدورات
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">تعديل الدورة</h1>
          <p className="text-gray-600 text-sm md:text-base">عدّل معلومات الدورة</p>
        </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Lessons Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <List className="w-5 md:w-6 h-5 md:h-6 text-primary-600" />
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">الدروس ({lessons.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => openLessonModal()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm md:text-base"
              >
                <Plus className="w-4 md:w-5 h-4 md:h-5" />
                <span>إضافة درس</span>
              </button>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600 text-sm md:text-base">
                      {lesson.order || index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base truncate">{lesson.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                        {lesson.videoUrl && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 md:w-4 md:h-4" />
                            فيديو
                          </span>
                        )}
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 md:w-4 md:h-4" />
                            {lesson.duration}
                          </span>
                        )}
                        {lesson.isFree && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        type="button"
                        onClick={() => openLessonModal(lesson)}
                        className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 text-gray-500">
                <List className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg mb-2">لا توجد دروس بعد</p>
                <p className="text-xs md:text-sm">ابدأ بإضافة أول درس للدورة</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 md:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الدورة *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الدورة *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المستوى *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">السعر (جنيه) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المدة *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="40 ساعة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المواضيع *</label>
                <div className="space-y-3">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                        placeholder={`الموضوع ${index + 1}`}
                      />
                      {formData.topics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTopic(index)}
                          className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTopic}
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة موضوع</span>
                  </button>
                </div>
              </div>

              {/* Drip Content Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">المحتوى بالتنقيط</h3>
                      <p className="text-sm text-gray-500">إتاحة الدروس تدريجياً للطلاب</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dripEnabled}
                      onChange={(e) => setFormData({ ...formData, dripEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">
                      {formData.dripEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </label>
                </div>

                {formData.dripEnabled && (
                  <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                    {/* Drip Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        نوع التنقيط
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'days' })}
                          className={`p-3 md:p-4 rounded-xl border-2 transition-all flex flex-row md:flex-col items-center gap-2 md:gap-2 ${
                            formData.dripType === 'days'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <CalendarDays className={`w-5 h-5 md:w-6 md:h-6 ${formData.dripType === 'days' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'days' ? 'text-primary-600' : 'text-gray-700'}`}>
                            بالأيام
                          </span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'lessons' })}
                          className={`p-3 md:p-4 rounded-xl border-2 transition-all flex flex-row md:flex-col items-center gap-2 md:gap-2 ${
                            formData.dripType === 'lessons'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <Layers className={`w-5 h-5 md:w-6 md:h-6 ${formData.dripType === 'lessons' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'lessons' ? 'text-primary-600' : 'text-gray-700'}`}>
                            بعد إكمال دروس
                          </span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'date' })}
                          className={`p-3 md:p-4 rounded-xl border-2 transition-all flex flex-row md:flex-col items-center gap-2 md:gap-2 ${
                            formData.dripType === 'date'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <Clock className={`w-5 h-5 md:w-6 md:h-6 ${formData.dripType === 'date' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'date' ? 'text-primary-600' : 'text-gray-700'}`}>
                            من تاريخ محدد
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Drip Interval */}
                    {formData.dripType !== 'date' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.dripType === 'days' ? 'عدد الأيام بين كل درس' : 'عدد الدروس المطلوب إكمالها'}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={formData.dripInterval}
                            onChange={(e) => setFormData({ ...formData, dripInterval: parseInt(e.target.value) || 1 })}
                            className="w-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 text-center text-lg font-bold"
                          />
                          <span className="text-gray-600">
                            {formData.dripType === 'days' ? 'يوم' : 'درس'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Drip Start Date */}
                    {formData.dripType === 'date' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          تاريخ بدء إتاحة المحتوى
                        </label>
                        <input
                          type="date"
                          value={formData.dripStartDate}
                          onChange={(e) => setFormData({ ...formData, dripStartDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sequential Lessons Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">إجبار ترتيب الدروس</h3>
                      <p className="text-sm text-gray-500">منع الطالب من الانتقال للدرس التالي إلا بعد إنهاء الحالي</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enforceSequentialLessons}
                      onChange={(e) => setFormData({ ...formData, enforceSequentialLessons: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">
                      {formData.enforceSequentialLessons ? 'مفعّل' : 'معطّل'}
                    </span>
                  </label>
                </div>

                {formData.enforceSequentialLessons && (
                  <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">كيف يعمل إجبار الترتيب؟</p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• <strong>الدرس الأول:</strong> متاح لجميع الطلاب دائماً</li>
                          <li>• <strong>الدروس التالية:</strong> تظهر مقفلة حتى يُنهي الطالب الدرس السابق</li>
                          <li>• <strong>علامة الإنهاء:</strong> يجب على الطالب مشاهدة الدرس كاملاً أو الضغط على "إنهاء الدرس"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">شهادة إتمام الدورة</h3>
                      <p className="text-sm text-gray-500">إصدار شهادة للطالب عند إكمال الدورة</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.certificateEnabled}
                      onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">
                      {formData.certificateEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </label>
                </div>

                {formData.certificateEnabled && (
                  <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">مميزات الشهادة:</p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• <strong>إصدار تلقائي:</strong> عند إكمال الطالب 100% من الدورة</li>
                          <li>• <strong>رقم فريد:</strong> لكل شهادة رقم خاص للتحقق</li>
                          <li>• <strong>قابلة للتحميل:</strong> يمكن للطالب تحميل ومشاركة الشهادة</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 md:mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm md:text-base"
              >
                إلغاء
              </button>
              <Link
                href={`/courses/${params.id}`}
                target="_blank"
                className="px-4 md:px-6 py-2.5 md:py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                <span>معاينة كطالب</span>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base py-2.5 md:py-3"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      {/* Lesson Modal - Disabled, using separate page instead */}
      {false && showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
              </h2>
            </div>

            <form onSubmit={handleLessonSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    عنوان الدرس *
                  </label>
                  <input
                    type="text"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    وصف الدرس
                  </label>
                  <textarea
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    محتوى الدرس
                  </label>
                  <textarea
                    value={lessonFormData.content}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
                    rows={6}
                    placeholder="اكتب محتوى الدرس هنا..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    رابط الفيديو
                  </label>
                  <input
                    type="url"
                    value={lessonFormData.videoUrl}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      المدة
                    </label>
                    <input
                      type="text"
                      value={lessonFormData.duration}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      placeholder="15 دقيقة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={lessonFormData.order}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={lessonFormData.isFree}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, isFree: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
                  />
                  <label htmlFor="isFree" className="text-sm font-semibold text-gray-900">
                    درس مجاني (متاح للجميع)
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={closeLessonModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  {editingLesson ? 'تحديث الدرس' : 'إضافة الدرس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
