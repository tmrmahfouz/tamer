'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Save, List, Edit, Trash2, Video, FileText, CheckCircle, Clock, CalendarDays, Layers, Lock, Award } from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

interface Category {
  _id: string
  name: string
  icon?: string
  parentCategory?: string | null
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lessons, setLessons] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', subcategory: '', level: 'مبتدئ', price: 0, duration: '', image: '🎓',
    topics: [''], published: false, dripEnabled: false, dripType: 'days' as 'days' | 'lessons' | 'date',
    dripInterval: 7, dripStartDate: '', enforceSequentialLessons: false, certificateEnabled: true,
  })

  const levels = ['مبتدئ', 'متوسط', 'متقدم']

  useEffect(() => {
    loadCategories()
    loadCourse()
    loadLessons()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?published=true')
      const data = await response.json()
      if (data.success) {
        // الفئات الرئيسية (التي ليس لها parent)
        const mainCats = data.categories.filter((cat: Category) => !cat.parentCategory)
        setCategories(mainCats)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadSubcategories = async (parentId: string) => {
    try {
      const response = await fetch('/api/categories?published=true')
      const data = await response.json()
      if (data.success) {
        const subs = data.categories.filter((cat: Category) => cat.parentCategory === parentId)
        setSubcategories(subs)
      }
    } catch (error) {
      console.error('Error loading subcategories:', error)
    }
  }

  const loadCourse = async () => {
    try {
      // Load all categories first to determine parent/child relationships
      const categoriesRes = await fetch('/api/categories?published=true')
      const categoriesData = await categoriesRes.json()
      const allCategories = categoriesData.success ? categoriesData.categories : []
      
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()
      if (data.success) {
        const course = data.course
        
        // Check if course.category is a subcategory
        const categoryObj = allCategories.find((cat: Category) => cat._id === course.category)
        let mainCategory = course.category
        let subCategory = ''
        
        if (categoryObj && categoryObj.parentCategory) {
          // course.category is actually a subcategory, so set parent as main category
          mainCategory = categoryObj.parentCategory
          subCategory = course.category
        }
        
        setFormData({
          title: course.title || '', description: course.description || '', category: mainCategory,
          subcategory: subCategory, level: course.level || 'مبتدئ', price: course.price || 0, 
          duration: course.duration || '', image: course.image || '🎓', 
          topics: course.topics?.length > 0 ? course.topics : [''],
          published: course.published || false, dripEnabled: course.dripEnabled || false,
          dripType: course.dripType || 'days', dripInterval: course.dripInterval || 7,
          dripStartDate: course.dripStartDate ? new Date(course.dripStartDate).toISOString().split('T')[0] : '',
          enforceSequentialLessons: course.enforceSequentialLessons || false,
          certificateEnabled: course.certificateEnabled !== false,
        })
        
        // Load subcategories for the main category
        if (mainCategory) {
          const subs = allCategories.filter((cat: Category) => cat.parentCategory === mainCategory)
          setSubcategories(subs)
        }
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
      if (data.success) setLessons(data.lessons || [])
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }


  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) { await loadLessons(); alert('تم حذف الدرس بنجاح') }
      else alert(data.message || 'حدث خطأ')
    } catch (error) {
      alert('حدث خطأ أثناء حذف الدرس')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...formData.topics]
    newTopics[index] = value
    setFormData({ ...formData, topics: newTopics })
  }

  const addTopic = () => setFormData({ ...formData, topics: [...formData.topics, ''] })
  const removeTopic = (index: number) => setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== index) })

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

    // إذا تم اختيار فئة فرعية، استخدمها كفئة رئيسية للدورة
    const courseCategory = formData.subcategory || formData.category

    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category: courseCategory, topics: filteredTopics }),
      })
      const data = await response.json()
      if (data.success) router.push('/instructor/courses')
      else setError(data.message || 'حدث خطأ أثناء تحديث الدورة')
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <InstructorLayout title="تعديل الدورة">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="تعديل الدورة">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <Link href="/instructor/courses" className="text-green-600 hover:text-green-700 mb-2 inline-block text-sm md:text-base">
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
              <List className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">الدروس ({lessons.length})</h2>
            </div>
            <Link href={`/instructor/courses/${params.id}/lessons/new`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm md:text-base">
              <Plus className="w-4 md:w-5 h-4 md:h-5" />
              <span>إضافة درس</span>
            </Link>
          </div>

          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-600 text-sm md:text-base">
                    {lesson.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base truncate">{lesson.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                      {lesson.videoUrl && <span className="flex items-center gap-1"><Video className="w-3 h-3 md:w-4 md:h-4" />فيديو</span>}
                      {lesson.duration && <span className="flex items-center gap-1"><FileText className="w-3 h-3 md:w-4 md:h-4" />{lesson.duration}</span>}
                      {lesson.isFree && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3 md:w-4 md:h-4" />مجاني</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Link href={`/instructor/courses/${params.id}/lessons/${lesson._id}/edit`}
                      className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                      <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                    <button type="button" onClick={() => handleDeleteLesson(lesson._id)}
                      className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
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
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الدورة *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none" />
            </div>

            {/* الفئات */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة الرئيسية *</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value, subcategory: '' })
                    if (e.target.value) {
                      loadSubcategories(e.target.value)
                    } else {
                      setSubcategories([])
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة الفرعية</label>
                <select 
                  name="subcategory" 
                  value={formData.subcategory} 
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                  disabled={!formData.category || subcategories.length === 0}
                >
                  <option value="">اختر الفئة الفرعية (اختياري)</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.icon} {sub.name}</option>
                  ))}
                </select>
                {formData.category && subcategories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">لا توجد فئات فرعية لهذه الفئة</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المستوى *</label>
                <select name="level" value={formData.level} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600">
                  {levels.map((level) => (<option key={level} value={level}>{level}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السعر (جنيه) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المدة *</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" placeholder="40 ساعة" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المواضيع *</label>
              <div className="space-y-3">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={topic} onChange={(e) => handleTopicChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" placeholder={`الموضوع ${index + 1}`} />
                    {formData.topics.length > 1 && (
                      <button type="button" onClick={() => removeTopic(index)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTopic}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-semibold">
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
                  <input type="checkbox" checked={formData.dripEnabled}
                    onChange={(e) => setFormData({ ...formData, dripEnabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">{formData.dripEnabled ? 'مفعّل' : 'معطّل'}</span>
                </label>
              </div>

              {formData.dripEnabled && (
                <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">نوع التنقيط</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={() => setFormData({ ...formData, dripType: 'days' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.dripType === 'days' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                        <CalendarDays className={`w-6 h-6 ${formData.dripType === 'days' ? 'text-green-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${formData.dripType === 'days' ? 'text-green-600' : 'text-gray-700'}`}>بالأيام</span>
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, dripType: 'lessons' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.dripType === 'lessons' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                        <Layers className={`w-6 h-6 ${formData.dripType === 'lessons' ? 'text-green-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${formData.dripType === 'lessons' ? 'text-green-600' : 'text-gray-700'}`}>بعد إكمال دروس</span>
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, dripType: 'date' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.dripType === 'date' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                        <Clock className={`w-6 h-6 ${formData.dripType === 'date' ? 'text-green-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${formData.dripType === 'date' ? 'text-green-600' : 'text-gray-700'}`}>من تاريخ محدد</span>
                      </button>
                    </div>
                  </div>
                  {formData.dripType !== 'date' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {formData.dripType === 'days' ? 'عدد الأيام بين كل درس' : 'عدد الدروس المطلوب إكمالها'}
                      </label>
                      <div className="flex items-center gap-3">
                        <input type="number" min="1" value={formData.dripInterval}
                          onChange={(e) => setFormData({ ...formData, dripInterval: parseInt(e.target.value) || 1 })}
                          className="w-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-center text-lg font-bold" />
                        <span className="text-gray-600">{formData.dripType === 'days' ? 'يوم' : 'درس'}</span>
                      </div>
                    </div>
                  )}
                  {formData.dripType === 'date' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ بدء إتاحة المحتوى</label>
                      <input type="date" value={formData.dripStartDate}
                        onChange={(e) => setFormData({ ...formData, dripStartDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
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
                  <input type="checkbox" checked={formData.enforceSequentialLessons}
                    onChange={(e) => setFormData({ ...formData, enforceSequentialLessons: e.target.checked })} className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">{formData.enforceSequentialLessons ? 'مفعّل' : 'معطّل'}</span>
                </label>
              </div>
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
                  <input type="checkbox" checked={formData.certificateEnabled}
                    onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">{formData.certificateEnabled ? 'مفعّل' : 'معطّل'}</span>
                </label>
              </div>
            </div>

            {/* Publish Status */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">حالة النشر</h3>
                  <p className="text-sm text-gray-500">هل الدورة متاحة للطلاب؟</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">{formData.published ? 'منشورة' : 'مسودة'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50">
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  )
}
