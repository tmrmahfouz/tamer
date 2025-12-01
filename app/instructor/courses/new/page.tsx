'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Save, Clock, CalendarDays, Layers, Lock, Eye } from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
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
    dripEnabled: false,
    dripType: 'days' as 'days' | 'lessons' | 'date',
    dripInterval: 7,
    dripStartDate: '',
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
      if (data.success) {
        const allCats = data.categories || []
        setAllCategories(allCats)
        const rootCategories = allCats.filter((cat: any) => !cat.parentCategory)
        setCategories(rootCategories)
        if (rootCategories.length > 0) {
          const firstCategory = rootCategories[0]
          setFormData(prev => ({ ...prev, category: firstCategory._id }))
          const subs = allCats.filter((cat: any) => cat.parentCategory === firstCategory._id)
          setSubcategories(subs)
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
    if (name === 'category') {
      const subs = allCategories.filter(cat => cat.parentCategory === value)
      setSubcategories(subs)
      setFormData({ ...formData, category: value, subcategory: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...formData.topics]
    newTopics[index] = value
    setFormData({ ...formData, topics: newTopics })
  }

  const addTopic = () => setFormData({ ...formData, topics: [...formData.topics, ''] })
  const removeTopic = (index: number) => setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== index) })

  const handleSubmit = async (published: boolean) => {
    setLoading(true)
    setError('')

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

    // إذا تم اختيار فئة فرعية، استخدمها كفئة رئيسية للدورة
    const courseCategory = formData.subcategory || formData.category

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category: courseCategory, topics: filteredTopics, published }),
      })
      const data = await response.json()
      if (data.success) {
        router.push(`/instructor/courses/${data.course._id}/lessons`)
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
    <InstructorLayout title="إنشاء دورة جديدة">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">إنشاء دورة جديدة</h1>
          <p className="text-gray-600 text-sm md:text-base">أضف معلومات الدورة الأساسية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الدورة *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="مثال: أساسيات البرمجة بلغة Python" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الدورة *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none"
                placeholder="اكتب وصفاً شاملاً للدورة..." />
            </div>

            {/* Category, Subcategory & Level */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة الرئيسية *</label>
                {loadingCategories ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-500">جاري تحميل الفئات...</p>
                  </div>
                ) : (
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                    disabled={categories.length === 0}>
                    {categories.length === 0 ? (
                      <option value="">لا توجد فئات متاحة</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                      ))
                    )}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة الفرعية</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                  disabled={subcategories.length === 0}>
                  <option value="">اختر الفئة الفرعية (اختياري)</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.icon} {sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المستوى *</label>
                <select name="level" value={formData.level} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600">
                  {levels.map((level) => (<option key={level} value={level}>{level}</option>))}
                </select>
              </div>
            </div>

            {/* Price & Duration */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السعر (جنيه) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" placeholder="499" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المدة *</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" placeholder="40 ساعة" />
              </div>
            </div>


            {/* Image Emoji */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رمز الدورة (Emoji) *</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-4xl shadow-lg">
                  {formData.image || '🎓'}
                </div>
                <div className="flex-1">
                  <input type="text" name="image" value={formData.image} onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-2xl text-center"
                    placeholder="🎓" maxLength={2} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">رموز شائعة:</p>
                <div className="flex flex-wrap gap-2">
                  {['🎓', '💻', '🎨', '📊', '🚀', '💼', '🌐', '📱', '🎬', '📷', '🎵', '📚', '🔬', '⚡', '🏆', '💡', '🎯', '📈', '🤖', '🧠'].map((emoji) => (
                    <button key={emoji} type="button" onClick={() => setFormData({ ...formData, image: emoji })}
                      className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${formData.image === emoji ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المواضيع التي ستتعلمها *</label>
              <div className="space-y-3">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={topic} onChange={(e) => handleTopicChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                      placeholder={`الموضوع ${index + 1}`} />
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
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button onClick={() => handleSubmit(false)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50">
              <Save className="w-5 h-5" />
              <span>حفظ كمسودة</span>
            </button>
            <button onClick={() => handleSubmit(true)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50">
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
    </InstructorLayout>
  )
}
