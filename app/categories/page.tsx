'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function CategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    icon: '📚',
    color: '#3B82F6',
    order: 0,
    published: true,
    subcategories: [] as string[],
  })
  const [newSubcategory, setNewSubcategory] = useState('')

  useEffect(() => {
    checkAuth()
    loadCategories()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          if (data.user.role !== 'admin' && data.user.role !== 'instructor') {
            router.push('/dashboard')
            return
          }
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories'

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          nameEn: '',
          description: '',
          icon: '📚',
          color: '#3B82F6',
          order: 0,
          published: true,
          subcategories: [],
        })
        loadCategories()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('حدث خطأ أثناء حفظ الفئة')
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      order: category.order,
      published: category.published,
      subcategories: category.subcategories || [],
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        loadCategories()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('حدث خطأ أثناء حذف الفئة')
    }
  }

  const iconOptions = [
    '📚', '💻', '🎨', '🔬', '📊', '🎯', '🚀', '💡',
    '🎓', '📱', '🌐', '🎬', '🎵', '📷', '✍️', '🏆',
    '💼', '🔧', '🎮', '📖', '🧪', '🎤', '📐', '🌟',
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 إدارة الفئات
            </h1>
            <p className="text-gray-600">
              إضافة وتعديل فئات الدورات التدريبية
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null)
              setFormData({
                name: '',
                nameEn: '',
                description: '',
                icon: '📚',
                color: '#3B82F6',
                order: 0,
                published: true,
                subcategories: [],
              })
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة فئة جديدة
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
                <div className="flex gap-2">
                  {category.published ? (
                    <Eye className="w-5 h-5 text-green-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{category.nameEn}</p>
              {category.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <BookOpen className="w-4 h-4" />
                <span>{category.coursesCount || 0} دورة</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد فئات بعد
            </h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإضافة فئة جديدة للدورات التدريبية
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة فئة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الفئة (بالعربية) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="مثال: البرمجة"
                />
              </div>

              {/* Name English */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الفئة (بالإنجليزية) *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="Example: Programming"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="وصف مختصر للفئة..."
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الأيقونة
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اللون
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="0"
                />
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="published" className="text-sm font-semibold text-gray-700">
                  نشر الفئة (إظهارها للمستخدمين)
                </label>
              </div>

              {/* Subcategories */}
              <div className="border-t pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  الفئات الفرعية
                </label>
                
                {/* Add Subcategory */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newSubcategory.trim()) {
                          setFormData({
                            ...formData,
                            subcategories: [...formData.subcategories, newSubcategory.trim()]
                          })
                          setNewSubcategory('')
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="أضف فئة فرعية (مثال: تطوير الويب)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubcategory.trim()) {
                        setFormData({
                          ...formData,
                          subcategories: [...formData.subcategories, newSubcategory.trim()]
                        })
                        setNewSubcategory('')
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Subcategories List */}
                {formData.subcategories.length > 0 && (
                  <div className="space-y-2">
                    {formData.subcategories.map((sub, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                      >
                        <span className="text-gray-700">{sub}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              subcategories: formData.subcategories.filter((_, i) => i !== index)
                            })
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    لا توجد فئات فرعية. أضف فئات فرعية لتسهيل تصنيف الدورات.
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingCategory ? 'حفظ التعديلات' : 'إضافة الفئة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
