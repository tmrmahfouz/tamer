'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Save, X, Loader2, ChevronDown, ChevronRight, FolderTree, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Category {
  _id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  color?: string
  order?: number
  coursesCount?: number
  parentCategory?: string | null
  children?: Category[]
}

export default function CategoriesPage() {
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
    color: '#3B82F6',
    parentCategory: '',
  })
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderChanged, setOrderChanged] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        // Organize categories into tree structure
        const allCategories = data.categories || []
        const organized = organizeCategories(allCategories)
        setCategories(organized)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }


  // Organize flat categories into tree structure
  const organizeCategories = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // First pass: create map
    flatCategories.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] })
    })

    // Second pass: build tree
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

    // Sort by order
    rootCategories.sort((a, b) => (a.order || 0) - (b.order || 0))
    rootCategories.forEach(cat => {
      if (cat.children) {
        cat.children.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    })

    return rootCategories
  }

  // Move category up or down
  const moveCategory = useCallback((categoryId: string, direction: 'up' | 'down', parentId?: string | null) => {
    setCategories(prev => {
      const newCategories = JSON.parse(JSON.stringify(prev)) as Category[]
      
      const findAndMove = (cats: Category[]): boolean => {
        const index = cats.findIndex(c => c._id === categoryId)
        if (index === -1) {
          // Search in children
          for (const cat of cats) {
            if (cat.children && findAndMove(cat.children)) {
              return true
            }
          }
          return false
        }

        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= cats.length) return false

        // Swap
        const temp = cats[index]
        cats[index] = cats[newIndex]
        cats[newIndex] = temp

        // Update order values
        cats.forEach((cat, i) => {
          cat.order = i
        })

        return true
      }

      if (parentId) {
        // Find parent and move within its children
        const findParent = (cats: Category[]): Category | null => {
          for (const cat of cats) {
            if (cat._id === parentId) return cat
            if (cat.children) {
              const found = findParent(cat.children)
              if (found) return found
            }
          }
          return null
        }
        const parent = findParent(newCategories)
        if (parent && parent.children) {
          findAndMove(parent.children)
        }
      } else {
        findAndMove(newCategories)
      }

      return newCategories
    })
    setOrderChanged(true)
  }, [])

  // Save new order to database
  const saveOrder = async () => {
    setSavingOrder(true)
    try {
      // Flatten categories with their new order
      const flattenWithOrder = (cats: Category[], parentId: string | null = null): { id: string; order: number; parentCategory: string | null }[] => {
        const result: { id: string; order: number; parentCategory: string | null }[] = []
        cats.forEach((cat, index) => {
          result.push({ id: cat._id, order: index, parentCategory: parentId })
          if (cat.children && cat.children.length > 0) {
            result.push(...flattenWithOrder(cat.children, cat._id))
          }
        })
        return result
      }

      const orderedCategories = flattenWithOrder(categories)

      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: orderedCategories }),
      })

      const data = await res.json()
      if (data.success) {
        setOrderChanged(false)
        alert('✅ تم حفظ الترتيب بنجاح')
      } else {
        alert('❌ ' + (data.message || 'حدث خطأ'))
      }
    } catch (error) {
      alert('❌ حدث خطأ أثناء حفظ الترتيب')
    } finally {
      setSavingOrder(false)
    }
  }

  // Get flat list of parent categories for dropdown
  const getParentOptions = (): Category[] => {
    const flatList: Category[] = []
    const flatten = (cats: Category[], level = 0) => {
      cats.forEach(cat => {
        if (cat._id !== editingId) { // Don't allow selecting self as parent
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
      
      const payload = {
        ...formData,
        nameEn: formData.nameEn || formData.name,
        parentCategory: formData.parentCategory || null,
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      color: category.color || '#3B82F6',
      parentCategory: category.parentCategory || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      alert('❌ لا يمكن حذف فئة تحتوي على فئات فرعية. احذف الفئات الفرعية أولاً.')
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
    setFormData({ name: '', nameEn: '', description: '', icon: '📚', color: '#3B82F6', parentCategory: '' })
  }

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addSubcategory = (parentId: string) => {
    resetForm()
    setFormData(prev => ({ ...prev, parentCategory: parentId }))
    setShowForm(true)
  }


  // Get siblings for checking if can move up/down
  const getSiblings = (categoryId: string, parentId?: string | null): Category[] => {
    if (!parentId) {
      return categories
    }
    const findParent = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat._id === parentId) return cat
        if (cat.children) {
          const found = findParent(cat.children)
          if (found) return found
        }
      }
      return null
    }
    const parent = findParent(categories)
    return parent?.children || []
  }

  // Render category row with children
  const renderCategory = (category: Category, level = 0, parentId?: string | null) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category._id)
    const siblings = getSiblings(category._id, parentId)
    const currentIndex = siblings.findIndex(c => c._id === category._id)
    const canMoveUp = currentIndex > 0
    const canMoveDown = currentIndex < siblings.length - 1

    return (
      <div key={category._id}>
        <div 
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b ${level > 0 ? 'bg-gray-50/50' : ''}`}
          style={{ paddingRight: `${16 + level * 24}px` }}
        >
          {/* Order Controls */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveCategory(category._id, 'up', parentId)}
              disabled={!canMoveUp}
              className={`p-0.5 rounded ${canMoveUp ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-gray-200 cursor-not-allowed'}`}
              title="تحريك لأعلى"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveCategory(category._id, 'down', parentId)}
              disabled={!canMoveDown}
              className={`p-0.5 rounded ${canMoveDown ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-gray-200 cursor-not-allowed'}`}
              title="تحريك لأسفل"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpand(category._id)}
            className={`p-1 rounded hover:bg-gray-200 ${!hasChildren ? 'invisible' : ''}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: category.color + '20' }}
          >
            {category.icon || '📚'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{category.name}</span>
              {level > 0 && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">فرعية</span>
              )}
              <span className="text-xs text-gray-400">#{(category.order ?? currentIndex) + 1}</span>
            </div>
            {category.description && (
              <p className="text-sm text-gray-500 truncate">{category.description}</p>
            )}
          </div>

          {/* Courses Count */}
          <div className="text-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {category.coursesCount || 0} دورة
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addSubcategory(category._id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="إضافة فئة فرعية"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="تعديل"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category._id, hasChildren || false)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1, category._id))}
          </div>
        )}
      </div>
    )
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

  const parentOptions = getParentOptions()
  const icons = ['📚', '💻', '🎨', '📊', '🎯', '🚀', '💡', '🔧', '📱', '🌐', '🎓', '📝']

  return (
    <AdminLayout title="إدارة الفئات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FolderTree className="w-7 h-7 text-primary-600" />
              إدارة الفئات
            </h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل الفئات الرئيسية والفرعية</p>
          </div>
          <div className="flex items-center gap-3">
            {orderChanged && (
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {savingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                حفظ الترتيب
              </button>
            )}
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              إضافة فئة رئيسية
            </button>
          </div>
        </div>


        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? 'تعديل الفئة' : formData.parentCategory ? 'إضافة فئة فرعية' : 'إضافة فئة رئيسية'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الفئة (عربي) *
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
                    اسم الفئة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Example: Programming"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة الأب (اختياري)
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- فئة رئيسية --</option>
                  {parentOptions.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="وصف مختصر للفئة..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأيقونة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                          formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللون
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
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

        {/* Categories Tree */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فئات بعد</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary-600 hover:underline"
              >
                إضافة فئة جديدة
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center gap-3 text-sm font-semibold text-gray-700">
                <div className="w-10 text-center">الترتيب</div>
                <div className="w-6"></div>
                <div className="w-10"></div>
                <div className="flex-1">الفئة</div>
                <div className="w-24 text-center">الدورات</div>
                <div className="w-32 text-center">الإجراءات</div>
              </div>
              {categories.map(category => renderCategory(category, 0, null))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
