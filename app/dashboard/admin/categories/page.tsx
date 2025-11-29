'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  coursesCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        fetchCategories()
        resetForm()
        alert(editingId ? '✅ تم تحديث الفئة بنجاح' : '✅ تم إضافة الفئة بنجاح')
      } else {
        alert('❌ ' + (data.message || 'حدث خطأ'))
      }
    } catch (error) {
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category._id)
    setFormData({ name: category.name, description: category.description || '' })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchCategories()
        alert('✅ تم حذف الفئة بنجاح')
      } else {
        alert('❌ ' + (data.message || 'حدث خطأ'))
      }
    } catch (error) {
      alert('❌ حدث خطأ أثناء الحذف')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة الفئات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الفئات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Tag className="w-7 h-7 text-primary-600" />
              إدارة الفئات
            </h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل فئات الدورات</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            إضافة فئة جديدة
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الفئة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="مثال: البرمجة"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="وصف مختصر للفئة..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فئات بعد</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary-600 hover:underline"
              >
                إضافة فئة جديدة
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">الفئة</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">الوصف</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">الدورات</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm hidden sm:table-cell">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {category.coursesCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
