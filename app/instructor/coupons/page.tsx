'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { Award, Plus, Edit, Trash2, Search, Save, X, Copy } from 'lucide-react'

export default function InstructorCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [formData, setFormData] = useState({ code: '', discount: '', type: 'percentage', maxUses: '', expiresAt: '' })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (data.success) setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : '/api/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, discount: Number(formData.discount), maxUses: Number(formData.maxUses) || null })
      })
      const data = await res.json()
      if (data.success) {
        loadCoupons()
        setShowModal(false)
        setEditingCoupon(null)
        setFormData({ code: '', discount: '', type: 'percentage', maxUses: '', expiresAt: '' })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadCoupons()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('تم نسخ الكود!')
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <InstructorLayout title="الكوبونات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">إدارة الكوبونات</h1>
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
              onClick={() => { setShowModal(true); setEditingCoupon(null); setFormData({ code: '', discount: '', type: 'percentage', maxUses: '', expiresAt: '' }) }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5" />
              إضافة كوبون
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا توجد كوبونات بعد</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخصم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستخدامات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصلاحية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-green-600">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded">
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discount}{coupon.type === 'percentage' ? '%' : ' جنيه'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.expiresAt ? (
                        <span className={new Date(coupon.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-600'}>
                          {new Date(coupon.expiresAt).toLocaleDateString('ar-EG')}
                        </span>
                      ) : (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingCoupon(coupon); setFormData({ code: coupon.code, discount: coupon.discount?.toString() || '', type: coupon.type || 'percentage', maxUses: coupon.maxUses?.toString() || '', expiresAt: coupon.expiresAt?.split('T')[0] || '' }); setShowModal(true) }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">كود الكوبون</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                    />
                    <button type="button" onClick={generateCode} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                      توليد
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">قيمة الخصم</label>
                    <input
                      type="number"
                      required
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع الخصم</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="percentage">نسبة مئوية</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الحد الأقصى للاستخدام</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      placeholder="غير محدود"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
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
