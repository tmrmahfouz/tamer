'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Save, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, 
  Layout, Star, BarChart, BookOpen, MessageSquare, Megaphone, FileText, Download, Layers 
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

// قائمة الأيقونات المتاحة للاختيار
const AVAILABLE_ICONS = [
  'Video', 'FileText', 'Award', 'Users', 'Clock', 'Headphones',
  'Code2', 'Brain', 'Sparkles', 'Rocket', 'Target', 'Zap',
  'Shield', 'Heart', 'Star', 'Trophy', 'Book', 'Laptop',
  'Globe', 'Camera', 'Music', 'Database', 'Cloud', 'Lock',
  'Check', 'Gift', 'ThumbsUp', 'Lightbulb', 'Cpu', 'Smartphone'
]

interface HomeSection {
  _id?: string
  type: 'hero' | 'features' | 'categories' | 'courses' | 'stats' | 'testimonials' | 'cta' | 'custom'
  title: string
  subtitle?: string
  content?: string
  isActive: boolean
  order: number
  settings: {
    backgroundColor?: string
    textColor?: string
    showButton?: boolean
    buttonText?: string
    buttonLink?: string
    imageUrl?: string
    items?: Array<{
      title?: string
      description?: string
      icon?: string
      value?: string
    }>
  }
}

const sectionTypes = [
  { value: 'hero', label: 'قسم البطل (Hero)', icon: Layout },
  { value: 'features', label: 'المميزات', icon: Star },
  { value: 'categories', label: 'المراحل الدراسية', icon: Layers },
  { value: 'courses', label: 'الدورات', icon: BookOpen },
  { value: 'stats', label: 'الإحصائيات', icon: BarChart },
  { value: 'testimonials', label: 'آراء الطلاب', icon: MessageSquare },
  { value: 'cta', label: 'دعوة لإجراء (CTA)', icon: Megaphone },
  { value: 'custom', label: 'قسم مخصص', icon: FileText },
]

export default function HomeEditorPage() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<HomeSection | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/home-sections')
      const data = await res.json()
      setSections(data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/home-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })

      if (res.ok) {
        alert('✅ تم حفظ التغييرات بنجاح!')
        await fetchSections()
      } else {
        const data = await res.json()
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSection = async (section: HomeSection) => {
    if (!section._id) return

    setSavingSectionId(section._id)
    try {
      const res = await fetch(`/api/home-sections/${section._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      })

      if (res.ok) {
        alert('✅ تم حفظ القسم بنجاح!')
        await fetchSections()
      } else {
        const data = await res.json()
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error saving section:', error)
      alert('❌ حدث خطأ أثناء حفظ القسم')
    } finally {
      setSavingSectionId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا القسم؟')) return

    try {
      const res = await fetch(`/api/home-sections/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('✅ تم حذف القسم بنجاح!')
        await fetchSections()
      } else {
        const data = await res.json()
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('❌ حدث خطأ أثناء الحذف')
    }
  }

  const handleAddSection = async (type: string) => {
    try {
      const newSection = {
        type,
        title: 'قسم جديد',
        subtitle: '',
        content: '',
        isActive: true,
        order: sections.length,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          showButton: false,
          buttonText: '',
          buttonLink: '',
          items: [],
        },
      }

      const res = await fetch('/api/home-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      })

      if (res.ok) {
        alert('✅ تم إضافة القسم بنجاح!')
        await fetchSections()
        setShowAddModal(false)
      } else {
        const data = await res.json()
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error adding section:', error)
      alert('❌ حدث خطأ أثناء الإضافة')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('⚠️ هل أنت متأكد من حذف جميع الأقسام؟ لن يمكن التراجع عن هذا الإجراء!')) {
      return
    }

    setSaving(true)
    try {
      const deletePromises = sections.map(section => 
        fetch(`/api/home-sections/${section._id}`, { method: 'DELETE' })
      )
      await Promise.all(deletePromises)
      alert('✅ تم حذف جميع الأقسام بنجاح!')
      await fetchSections()
    } catch (error) {
      console.error('Error deleting all sections:', error)
      alert('❌ حدث خطأ أثناء الحذف')
    } finally {
      setSaving(false)
    }
  }

  const handleImportDefault = async () => {
    if (sections.length > 0) {
      if (!confirm('⚠️ توجد أقسام حالياً. سيتم حذفها واستيراد الأقسام الافتراضية من الصفحة الرئيسية. لن يمكن التراجع عن هذا الإجراء!')) {
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/home-sections/import-default', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ تم استيراد ${data.count} أقسام بنجاح من الصفحة الرئيسية!`)
        await fetchSections()
      } else {
        console.error('Import error:', data)
        alert(`❌ ${data.error}${data.details ? '\n\nالتفاصيل: ' + data.details : ''}`)
      }
    } catch (error) {
      console.error('Error importing default sections:', error)
      alert('❌ حدث خطأ أثناء الاستيراد')
    } finally {
      setSaving(false)
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newSections.length) return

    const [movedSection] = newSections.splice(index, 1)
    newSections.splice(targetIndex, 0, movedSection)

    // Update order numbers
    newSections.forEach((section, idx) => {
      section.order = idx
    })

    setSections(newSections)
  }

  const toggleActive = (index: number) => {
    const newSections = [...sections]
    newSections[index].isActive = !newSections[index].isActive
    setSections(newSections)
  }

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections]
    if (field.startsWith('settings.')) {
      const settingKey = field.replace('settings.', '')
      newSections[index].settings = {
        ...newSections[index].settings,
        [settingKey]: value,
      }
    } else {
      newSections[index] = {
        ...newSections[index],
        [field]: value,
      }
    }
    setSections(newSections)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">محرر الصفحة الرئيسية</h1>
          <p className="text-gray-600">قم بإضافة وتحرير وترتيب أقسام الصفحة الرئيسية</p>
        </div>
        <div className="flex gap-3">
          {sections.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={saving}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              حذف الكل
            </button>
          )}
          <button
            onClick={handleImportDefault}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 font-medium"
          >
            <Download className="w-5 h-5" />
            استيراد الأقسام الحالية
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة قسم جديد
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      {sections.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">طريقتان للحفظ:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>حفظ هذا القسم:</strong> يحفظ تعديلات القسم الحالي فقط (موجود تحت كل قسم)</li>
                <li>• <strong>حفظ التغييرات:</strong> يحفظ الترتيب الجديد للأقسام (الزر في الأعلى)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد أقسام بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة قسم جديد أو استيراد الأقسام الموجودة في الصفحة الرئيسية</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleImportDefault}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 inline-flex items-center gap-2 font-medium justify-center"
              >
                <Download className="w-5 h-5" />
                استيراد من الصفحة الحالية
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center gap-2 justify-center"
              >
                <Plus className="w-5 h-5" />
                إضافة قسم مخصص
              </button>
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>💡 نصيحة:</strong> يمكنك استيراد جميع الأقسام الموجودة في الصفحة الرئيسية الحالية
                (Hero, Features, Categories, Courses, Stats, Testimonials, CTA) ثم تعديلها حسب رغبتك!
              </p>
            </div>
          </div>
        ) : (
          sections.map((section, index) => {
            const SectionIcon = sectionTypes.find(t => t.value === section.type)?.icon || FileText
            
            return (
              <div
                key={section._id || index}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  !section.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <SectionIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500">
                        {sectionTypes.find(t => t.value === section.type)?.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up/Down */}
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="تحريك لأعلى"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="تحريك لأسفل"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleActive(index)}
                      className={`p-2 rounded ${
                        section.isActive
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                      title={section.isActive ? 'إخفاء القسم' : 'إظهار القسم'}
                    >
                      {section.isActive ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => section._id && handleDelete(section._id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان القسم
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العنوان الفرعي
                      </label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        onChange={(e) => updateSection(index, 'subtitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المحتوى
                    </label>
                    <textarea
                      value={section.content || ''}
                      onChange={(e) => updateSection(index, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        لون الخلفية
                      </label>
                      <input
                        type="color"
                        value={section.settings.backgroundColor}
                        onChange={(e) =>
                          updateSection(index, 'settings.backgroundColor', e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        لون النص
                      </label>
                      <input
                        type="color"
                        value={section.settings.textColor}
                        onChange={(e) =>
                          updateSection(index, 'settings.textColor', e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.settings.showButton}
                          onChange={(e) =>
                            updateSection(index, 'settings.showButton', e.target.checked)
                          }
                          className="w-5 h-5 text-primary-600"
                        />
                        <span className="text-sm font-medium text-gray-700">إظهار زر</span>
                      </label>
                    </div>
                  </div>

                  {section.settings.showButton && section.type !== 'hero' && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نص الزر
                        </label>
                        <input
                          type="text"
                          value={section.settings.buttonText || ''}
                          onChange={(e) =>
                            updateSection(index, 'settings.buttonText', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رابط الزر
                        </label>
                        <input
                          type="text"
                          value={section.settings.buttonLink || ''}
                          onChange={(e) =>
                            updateSection(index, 'settings.buttonLink', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Hero Image Settings */}
                  {section.type === 'hero' && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <h4 className="font-semibold text-gray-900">إعدادات صورة البطل (Hero Image)</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صورة المعلم (رابط الصورة أو ارفع ملف)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={section.settings.imageUrl || ''}
                            onChange={(e) =>
                              updateSection(index, 'settings.imageUrl', e.target.value)
                            }
                            placeholder="https://example.com/image.png"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              try {
                                const uploadRes = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData,
                                })
                                const uploadData = await uploadRes.json()
                                if (uploadData.success) {
                                  updateSection(index, 'settings.imageUrl', uploadData.url)
                                  alert('✅ تم رفع الصورة بنجاح!')
                                } else {
                                  alert('❌ ' + uploadData.message)
                                }
                              } catch (uploadErr) {
                                console.error('Error uploading hero image:', uploadErr)
                                alert('❌ حدث خطأ أثناء الرفع')
                              }
                            }}
                            className="hidden"
                            id={`hero-image-upload-${index}`}
                          />
                          <label
                            htmlFor={`hero-image-upload-${index}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer shrink-0 font-medium transition-colors"
                          >
                            رفع صورة
                          </label>
                        </div>
                        {section.settings.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={section.settings.imageUrl}
                              alt="Hero Preview"
                              className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items Editor */}
                  {section.settings.items && section.settings.items.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {section.type === 'features' && '🎯 المميزات'}
                          {section.type === 'hero' && '✨ العناصر'}
                          {section.type === 'testimonials' && '💬 الشهادات'}
                          {section.type === 'stats' && '📊 الإحصائيات'}
                          {!['features', 'hero', 'testimonials', 'stats'].includes(section.type) && '📋 العناصر'}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {section.settings.items.length} عنصر
                        </span>
                      </div>

                      <div className="space-y-4">
                        {section.settings.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {section.type === 'testimonials' ? 'الاسم' : 
                                   section.type === 'stats' ? 'العنوان' : 'العنوان'}
                                </label>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => {
                                    const newItems = [...(section.settings.items || [])]
                                    newItems[itemIndex] = { ...item, title: e.target.value }
                                    updateSection(index, 'settings.items', newItems)
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {section.type === 'stats' ? 'الأيقونة (Lucide)' : 
                                   section.type === 'features' ? 'الأيقونة (Lucide)' : 
                                   section.type === 'hero' ? 'الأيقونة (Lucide)' : 'الأيقونة/Emoji'}
                                </label>
                                {(section.type === 'features' || section.type === 'hero' || section.type === 'stats') ? (
                                  <div className="flex gap-2 items-center">
                                    <select
                                      value={item.icon || ''}
                                      onChange={(e) => {
                                        const newItems = [...(section.settings.items || [])]
                                        newItems[itemIndex] = { ...item, icon: e.target.value }
                                        updateSection(index, 'settings.items', newItems)
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                                    >
                                      <option value="">اختر أيقونة...</option>
                                      {AVAILABLE_ICONS.map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                      ))}
                                    </select>
                                    {item.icon && (() => {
                                      const IconPreview = (LucideIcons as any)[item.icon]
                                      return IconPreview ? (
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                          <IconPreview className="w-6 h-6 text-white" />
                                        </div>
                                      ) : null
                                    })()}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={item.icon || item.value || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, icon: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="🎥"
                                  />
                                )}
                              </div>

                              {section.type === 'stats' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    القيمة (مثل: 500+, 98%)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, value: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="500+"
                                  />
                                </div>
                              )}

                              {section.type !== 'stats' && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {section.type === 'testimonials' ? 'نص الشهادة' : 'الوصف'}
                                  </label>
                                  <textarea
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, description: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  />
                                </div>
                              )}

                              {section.type === 'hero' && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    نوع العنصر (badge, feature1, feature2, /courses, /about)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, value: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="badge أو feature1 أو /courses"
                                  />
                                </div>
                              )}

                              {section.type === 'features' && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Gradient Colors (مثال: from-blue-500 to-blue-600)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, value: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  />
                                </div>
                              )}

                              {section.type === 'testimonials' && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    الدور والتقييم (مثال: طالب - دورة Python|5)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const newItems = [...(section.settings.items || [])]
                                      newItems[itemIndex] = { ...item, value: e.target.value }
                                      updateSection(index, 'settings.items', newItems)
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Section Button */}
                  <div className="pt-4 border-t mt-6">
                    <button
                      onClick={() => handleSaveSection(section)}
                      disabled={savingSectionId === section._id}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {savingSectionId === section._id ? 'جاري الحفظ...' : 'حفظ هذا القسم'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">اختر نوع القسم</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sectionTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => handleAddSection(type.value)}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{type.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
