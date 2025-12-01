'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, Edit, Trash2, Save, X, Loader2, ChevronDown, ChevronRight, FolderTree } from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

interface Category {
  _id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  color?: string
  coursesCount?: number
  parentCategory?: string | null
  children?: Category[]
}

export default function InstructorCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    icon: '📚',
    color: '#10B981',
    parentCategory: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        const organized = organizeCategories(data.categories || [])
        setCategories(organized)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const organizeCategories = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    flatCategories.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] })
    })

    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat._id)!
      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(category)
        } else {
          rootCategories.push(category)
        }
      } else {
        rootCategories.push(category)
      }
    })

    return rootCategories
  }

  const getParentOptions = (): Category[] => {
    const flatList: Category[] = []
    const flatten = (cats: Category[], level = 0) => {
      cats.forEach(cat => {
        if (cat._id !== editingId) {
          flatList.push({ ...cat, name: '─'.repeat(level) + ' ' + cat.name })
        }
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, level + 1)
        }
      })
    }
    flatten(categories)
    return flatList
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
        body: JSON.stringify({
          ...formData,
          nameEn: formData.nameEn || formData.name,
          parentCategory: formData.parentCategory || null,
        }),
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
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      icon: category.icon || '📚',
      color: category.color || '#10B981',
      parentCategory: category.parentCategory || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      alert('❌ لا يمكن حذف فئة تحتوي على فئات فرعية')
      return
    }
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
    setFormData({ name: '', nameEn: '', description: '', icon: '📚', color: '#10B981', parentCategory: '' })
  }

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category._id)

    return (
      <div key={category._id}>
        <div 
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b ${level > 0 ? 'bg-gray-50/50' : ''}`}
          style={{ paddingRight: `${16 + level * 24}px` }}
        >
          <button
            onClick={() => toggleExpand(category._id)}
            className={`p-1 rounded hover:bg-gray-200 ${!hasChildren ? 'invisible' : ''}`}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          </button>

          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: category.color + '20' }}>
            {category.icon || '📚'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{category.name}</span>
              {level > 0 && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">فرعية</span>}
            </div>
            {category.description && <p className="text-sm text-gray-500 truncate">{category.description}</p>}
          </div>

          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{category.coursesCount || 0} دورة</span>

          <div className="flex items-center gap-1">
            <button onClick={() => { resetForm(); setFormData(prev => ({ ...prev, parentCategory: category._id })); setShowForm(true) }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="إضافة فئة فرعية">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="تعديل">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(category._id, hasChildren || false)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && <div>{category.children!.map(child => renderCategory(child, level + 1))}</div>}
      </div>
    )
  }

  if (loading) {
    return (
      <InstructorLayout title="إدارة الفئات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </InstructorLayout>
    )
  }

  const icons = ['📚', '💻', '🎨', '📊', '🎯', '🚀', '💡', '🔧', '📱', '🌐', '🎓', '📝']

  return (
    <InstructorLayout title="إدارة الفئات">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FolderTree className="w-7 h-7 text-green-600" />
              إدارة الفئات
            </h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل الفئات الرئيسية والفرعية</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-5 h-5" />
            إضافة فئة رئيسية
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? 'تعديل الفئة' : formData.parentCategory ? 'إضافة فئة فرعية' : 'إضافة فئة رئيسية'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفئة (عربي) *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفئة (إنجليزي)</label>
                  <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة الأب (اختياري)</label>
                <select value={formData.parentCategory} onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">-- فئة رئيسية --</option>
                  {getParentOptions().map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" rows={2} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                  <div className="flex flex-wrap gap-2">
                    {icons.map(icon => (
                      <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${formData.icon === icon ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'تحديث' : 'حفظ'}
                </button>
                <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <X className="w-4 h-4" />
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فئات بعد</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-green-600 hover:underline">إضافة فئة جديدة</button>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center gap-3 text-sm font-semibold text-gray-700">
                <div className="w-6"></div>
                <div className="w-10"></div>
                <div className="flex-1">الفئة</div>
                <div className="w-24 text-center">الدورات</div>
                <div className="w-32 text-center">الإجراءات</div>
              </div>
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </div>
      </div>
    </InstructorLayout>
  )
}
