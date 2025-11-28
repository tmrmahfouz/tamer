'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Save, Clock, CalendarDays, Layers, Lock, Eye } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
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
  })

  const levels = ['مبتدئ', 'متوسط', 'متقدم']

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?published=true')
      const data = await response.json()

      console.log('Categories loaded:', data.categories) // للتحقق

      if (data.success) {
        setCategories(data.categories)
        // Set first category as default and load its subcategories
        if (data.categories.length > 0) {
          const firstCategory = data.categories[0]
          console.log('First category subcategories:', firstCategory.subcategories) // للتحقق
          setFormData(prev => ({ ...prev, category: firstCategory._id }))
          setSubcategories(firstCategory.subcategories || [])
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If category changed, update subcategories
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat._id === value)
      setSubcategories(selectedCategory?.subcategories || [])
      setFormData({
        ...formData,
        category: value,
        subcategory: '', // Reset subcategory when category changes
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
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

  const handleSubmit = async (published: boolean) => {
    setLoading(true)
    setError('')

    // Validation
    if (!formData.title || !formData.description) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      setLoading(false)
      return
    }

    const filteredTopics = formData.topics.filter(t => t.trim() !== '')
    if (filteredTopics.length === 0) {
      setError('الرجاء إضافة موضوع واحد على الأقل')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topics: filteredTopics,
          published,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/courses/${data.course._id}/lessons`)
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء الدورة')
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create New Course">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600 text-sm md:text-base">Add basic course information</p>
        </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  عنوان الدورة *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="مثال: أساسيات البرمجة بلغة Python"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  وصف الدورة *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                  placeholder="اكتب وصفاً شاملاً للدورة..."
                />
              </div>

              {/* Category, Subcategory & Level */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الفئة الرئيسية *
                  </label>
                  {loadingCategories ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-500">جاري تحميل الفئات...</p>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      disabled={categories.length === 0}
                    >
                      {categories.length === 0 ? (
                        <option value="">لا توجد فئات متاحة</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {categories.length === 0 && !loadingCategories && (
                    <p className="text-xs text-red-500 mt-1">
                      الرجاء إضافة فئات من{' '}
                      <Link href="/categories" className="underline">
                        صفحة الفئات
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الفئة الفرعية
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    disabled={subcategories.length === 0}
                  >
                    <option value="">اختر الفئة الفرعية (اختياري)</option>
                    {subcategories.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {subcategories.length === 0 && formData.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      لا توجد فئات فرعية لهذه الفئة
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المستوى *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    السعر (جنيه) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="499"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المدة *
                  </label>
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

              {/* Image Emoji */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رمز الدورة (Emoji) *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-4xl shadow-lg">
                    {formData.image || '🎓'}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 text-2xl text-center"
                      placeholder="🎓"
                      maxLength={2}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 نسخ رمز من:{' '}
                      <a
                        href="https://emojipedia.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        Emojipedia
                      </a>
                      {' '}أو استخدم لوحة المفاتيح (Windows + .)
                    </p>
                  </div>
                </div>
                
                {/* Popular Emojis */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">رموز شائعة:</p>
                  <div className="flex flex-wrap gap-2">
                    {['🎓', '💻', '🎨', '📊', '🚀', '💼', '🌐', '📱', '🎬', '📷', '🎵', '📚', '🔬', '⚡', '🏆', '💡', '🎯', '📈', '🤖', '🧠'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: emoji })}
                        className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.image === emoji
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المواضيع التي ستتعلمها *
                </label>
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
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'days' })}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.dripType === 'days'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <CalendarDays className={`w-6 h-6 ${formData.dripType === 'days' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'days' ? 'text-primary-600' : 'text-gray-700'}`}>
                            بالأيام
                          </span>
                          <span className="text-xs text-gray-500">درس كل X أيام</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'lessons' })}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.dripType === 'lessons'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <Layers className={`w-6 h-6 ${formData.dripType === 'lessons' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'lessons' ? 'text-primary-600' : 'text-gray-700'}`}>
                            بعد إكمال دروس
                          </span>
                          <span className="text-xs text-gray-500">درس بعد كل X دروس</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dripType: 'date' })}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.dripType === 'date'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <Clock className={`w-6 h-6 ${formData.dripType === 'date' ? 'text-primary-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${formData.dripType === 'date' ? 'text-primary-600' : 'text-gray-700'}`}>
                            من تاريخ محدد
                          </span>
                          <span className="text-xs text-gray-500">بدءاً من تاريخ معين</span>
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
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.dripType === 'days' 
                            ? `سيتم إتاحة درس جديد كل ${formData.dripInterval} يوم للطالب بعد التسجيل`
                            : `سيتم إتاحة درس جديد بعد إكمال ${formData.dripInterval} دروس`
                          }
                        </p>
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
                        <p className="text-xs text-gray-500 mt-2">
                          سيتم إتاحة درس جديد كل يوم بدءاً من هذا التاريخ
                        </p>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">كيف يعمل المحتوى بالتنقيط؟</p>
                          <p className="text-xs text-gray-600 mt-1">
                            عند تفعيل هذه الميزة، لن يتمكن الطلاب من الوصول لجميع الدروس دفعة واحدة.
                            سيتم إتاحة الدروس تدريجياً حسب الإعدادات التي تختارها، مما يساعد على:
                          </p>
                          <ul className="text-xs text-gray-600 mt-2 space-y-1">
                            <li>• منع الطلاب من التسرع في المحتوى</li>
                            <li>• ضمان استيعاب كل درس قبل الانتقال للتالي</li>
                            <li>• زيادة معدل إكمال الدورات</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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
                          <li>• <strong>التقدم:</strong> يتم حفظ تقدم الطالب تلقائياً</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كمسودة</span>
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    <span>نشر الدورة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
    </AdminLayout>
  )
}
