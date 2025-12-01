'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { Package, Plus, Edit, Trash2, X, Search, Percent, Calendar, Users, Loader2 } from 'lucide-react'

interface Course {
  _id: string
  title: string
  price: number
  thumbnail: string
}

interface Bundle {
  _id: string
  name: string
  description: string
  image: string
  courses: Course[]
  originalPrice: number
  discountPercentage: number
  finalPrice: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
  maxPurchases?: number
  currentPurchases: number
}

export default function InstructorBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '', description: '', image: '', courses: [] as string[], discountPercentage: 0, isActive: true, validFrom: '', validUntil: '', maxPurchases: ''
  })

  useEffect(() => {
    fetchBundles()
    fetchCourses()
  }, [])

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/admin/bundles')
      const data = await res.json()
      if (data.success) setBundles(data.bundles)
    } catch (error) {
      console.error('Error fetching bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/instructor/courses')
      const data = await res.json()
      if (data.success) setCourses(data.courses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.courses.length === 0) {
      setError('يجب اختيار دورة واحدة على الأقل')
      return
    }
    
    setSaving(true)
    
    try {
      const url = editingBundle ? `/api/admin/bundles/${editingBundle._id}` : '/api/admin/bundles'
      
      const res = await fetch(url, {
        method: editingBundle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: formData.image,
          courses: formData.courses,
          discountPercentage: formData.discountPercentage,
          isActive: formData.isActive,
          validFrom: formData.validFrom || undefined,
          validUntil: formData.validUntil || undefined,
          maxPurchases: formData.maxPurchases ? parseInt(formData.maxPurchases) : undefined,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        fetchBundles()
        closeModal()
      } else {
        setError(data.error || 'حدث خطأ أثناء الحفظ')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحزمة؟')) return
    
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchBundles()
    } catch (error) {
      console.error('Error deleting bundle:', error)
    }
  }

  const openModal = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundle(bundle)
      setFormData({
        name: bundle.name, description: bundle.description, image: bundle.image, courses: bundle.courses.map(c => c._id),
        discountPercentage: bundle.discountPercentage, isActive: bundle.isActive,
        validFrom: bundle.validFrom ? bundle.validFrom.split('T')[0] : '',
        validUntil: bundle.validUntil ? bundle.validUntil.split('T')[0] : '',
        maxPurchases: bundle.maxPurchases?.toString() || ''
      })
    } else {
      setEditingBundle(null)
      setFormData({ name: '', description: '', image: '', courses: [], discountPercentage: 0, isActive: true, validFrom: '', validUntil: '', maxPurchases: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBundle(null)
    setError('')
  }

  const toggleCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId) ? prev.courses.filter(id => id !== courseId) : [...prev.courses, courseId]
    }))
  }

  const calculateOriginalPrice = () => formData.courses.reduce((sum, courseId) => {
    const course = courses.find(c => c._id === courseId)
    return sum + (course?.price || 0)
  }, 0)

  const calculateFinalPrice = () => Math.round(calculateOriginalPrice() * (1 - formData.discountPercentage / 100))

  const filteredBundles = bundles.filter(bundle => bundle.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <InstructorLayout title="حزم الدورات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="حزم الدورات">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-7 h-7 text-green-600" />
              حزم الدورات
            </h1>
            <p className="text-gray-600 mt-1">إدارة حزم الدورات والعروض الخاصة</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-5 h-5" />
            إضافة حزمة جديدة
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="البحث في الحزم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        {filteredBundles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد حزم بعد</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.map(bundle => (
              <div key={bundle._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {bundle.image && <img src={bundle.image} alt={bundle.name} className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{bundle.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${bundle.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {bundle.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bundle.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-green-600">{bundle.finalPrice} ج.م</span>
                    {bundle.discountPercentage > 0 && (
                      <>
                        <span className="text-gray-400 line-through text-sm">{bundle.originalPrice} ج.م</span>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">-{bundle.discountPercentage}%</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">{bundle.courses.length} دورات في هذه الحزمة</div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => openModal(bundle)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-1">
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(bundle._id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingBundle ? 'تعديل الحزمة' : 'إضافة حزمة جديدة'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium mb-1">اسم الحزمة *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">اختر الدورات *</label>
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {courses.map(course => (
                    <label key={course._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                      <input type="checkbox" checked={formData.courses.includes(course._id)} onChange={() => toggleCourse(course._id)} className="w-4 h-4 text-green-600 rounded" />
                      <span className="flex-1">{course.title}</span>
                      <span className="text-gray-500 text-sm">{course.price} ج.م</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">تم اختيار {formData.courses.length} دورات</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Percent className="w-4 h-4" />نسبة الخصم (%)</label>
                <input type="number" min="0" max="100" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              
              {formData.courses.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2"><span className="text-gray-600">السعر الأصلي:</span><span className="font-medium">{calculateOriginalPrice()} ج.م</span></div>
                  <div className="flex justify-between mb-2"><span className="text-gray-600">الخصم:</span><span className="text-red-600">-{formData.discountPercentage}%</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-bold">السعر النهائي:</span><span className="font-bold text-green-600 text-xl">{calculateFinalPrice()} ج.م</span></div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" />تاريخ البداية</label>
                  <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                  <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Users className="w-4 h-4" />الحد الأقصى للمشتريات</label>
                <input type="number" min="0" value={formData.maxPurchases} onChange={(e) => setFormData({ ...formData, maxPurchases: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="اتركه فارغاً لعدم وجود حد" />
              </div>
              
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-green-600 rounded" />
                <span>الحزمة نشطة ومتاحة للشراء</span>
              </label>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : (editingBundle ? 'حفظ التغييرات' : 'إنشاء الحزمة')}
                </button>
                <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </InstructorLayout>
  )
}
