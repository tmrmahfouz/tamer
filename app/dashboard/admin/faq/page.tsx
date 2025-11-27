'use client'

import { useState, useEffect } from 'react'
import { 
  HelpCircle, Plus, Edit, Trash2, Save, X, 
  ChevronDown, ChevronUp, GripVertical, Loader2
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'عام'
  })

  const categories = ['عام', 'الدورات', 'الدفع', 'الشهادات', 'الدعم الفني']

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/admin/faq')
      const data = await res.json()
      if (data.success) {
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.question || !formData.answer) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowAddForm(false)
        setFormData({ question: '', answer: '', category: 'عام' })
        fetchFAQs()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUpdate = async (id: string, data: Partial<FAQ>) => {
    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setEditingId(null)
        fetchFAQs()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return

    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFaqs(prev => prev.filter(f => f._id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await handleUpdate(id, { isActive: !isActive })
  }

  if (loading) {
    return (
      <AdminLayout title="الأسئلة الشائعة">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="الأسئلة الشائعة">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-primary-600" />
              الأسئلة الشائعة
            </h1>
            <p className="text-gray-600 mt-1">إدارة الأسئلة الشائعة للمنصة</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
          إضافة سؤال
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">إضافة سؤال جديد</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السؤال</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="اكتب السؤال هنا..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الإجابة</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="اكتب الإجابة هنا..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs List */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">قائمة الأسئلة ({faqs.length})</h2>
        </div>
        <div className="divide-y">
          {faqs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد أسئلة شائعة</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <div key={faq._id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {faq.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(faq._id, faq.isActive)}
                      className={`p-2 rounded-lg ${
                        faq.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {faq.isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
