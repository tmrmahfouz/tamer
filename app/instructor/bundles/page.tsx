'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { Package, Plus, Edit, Trash2, Search, Save, X, BookOpen } from 'lucide-react'

export default function InstructorBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBundle, setEditingBundle] = useState<any>(null)
  const [formData, setFormData] = useState({ title: '', description: '', price: '', courses: [] as string[], discount: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [bundlesRes, coursesRes] = await Promise.all([
        fetch('/api/admin/bundles'),
        fetch('/api/instructor/courses')
      ])
      const bundlesData = await bundlesRes.json()
      const coursesData = await coursesRes.json()
      if (bundlesData.success) setBundles(bundlesData.bundles || [])
      if (coursesData.success) setCourses(coursesData.courses || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBundle ? `/api/admin/bundles/${editingBundle._id}` : '/api/admin/bundles'
      const method = editingBundle ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.title,
          description: formData.description,
          courses: formData.courses,
          discountPercentage: Number(formData.discount) || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        loadData()
        setShowModal(false)
        setEditingBundle(null)
        setFormData({ title: '', description: '', price: '', courses: [], discount: '' })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteBundle = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredBundles = bundles.filter(bundle =>
    bundle.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <InstructorLayout title="حزم الدورات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">إدارة الحزم</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => { setShowModal(true); setEditingBundle(null); setFormData({ title: '', description: '', price: '', courses: [], discount: '' }) }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5" />
              إضافة حزمة
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا توجد حزم بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBundles.map((bundle) => (
              <div key={bundle._id} className="bg-white rounded-xl shadow-sm p-4 border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{bundle.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingBundle(bundle); setFormData({ title: bundle.title, description: bundle.description || '', price: bundle.price?.toString() || '', courses: bundle.courses?.map((c: any) => c._id || c) || [], discount: bundle.discount?.toString() || '' }); setShowModal(true) }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBundle(bundle._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    {bundle.courses?.length || 0} دورات
                  </span>
                  <span className="font-bold text-green-600">{bundle.price} جنيه</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingBundle ? 'تعديل الحزمة' : 'إضافة حزمة'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم الحزمة</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">السعر</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الخصم %</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الدورات</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {courses.map((course) => (
                      <label key={course._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.courses.includes(course._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, courses: [...formData.courses, course._id] })
                            } else {
                              setFormData({ ...formData, courses: formData.courses.filter(id => id !== course._id) })
                            }
                          }}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-5 h-5" />
                  حفظ
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
