'use client'

import { useEffect, useState } from 'react'
import {
  Ticket, Plus, Search, Edit, Trash2, Calendar, TrendingUp, Users, CheckCircle, XCircle, Percent, DollarSign, Loader2, Copy
} from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  usedCount: number
  expiresAt: string
  isActive: boolean
  courses: any[]
  createdAt: string
}

export default function InstructorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const [formData, setFormData] = useState({
    code: '', discountType: 'percentage' as 'percentage' | 'fixed', discountValue: 0, maxUses: 0, expiresAt: '', isActive: true
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      const data = await response.json()
      if (data.success) setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : '/api/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          discount: formData.discountValue,
          type: formData.discountType,
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt,
          isActive: formData.isActive
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message || 'تم الحفظ بنجاح')
        setShowModal(false)
        resetForm()
        loadCoupons()
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return

    try {
      const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        alert(data.message || 'تم الحذف')
        loadCoupons()
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({ code: '', discountType: 'percentage', discountValue: 0, maxUses: 0, expiresAt: '', isActive: true })
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
    setFormData({ ...formData, code })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('تم نسخ الكود!')
  }

  const filteredCoupons = coupons.filter(coupon => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))
  const isExpired = (date: string) => date && new Date(date) < new Date()

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length,
    expired: coupons.filter(c => !c.isActive || isExpired(c.expiresAt)).length,
    totalUsage: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)
  }

  if (loading) {
    return (
      <InstructorLayout title="إدارة الكوبونات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="إدارة الكوبونات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الكوبونات</h1>
            <p className="text-gray-600">إدارة كوبونات الخصم والعروض الترويجية</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-5 h-5" />
            إضافة كوبون
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">إجمالي الكوبونات</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">كوبونات نشطة</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm text-gray-600">كوبونات منتهية</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-600">مرات الاستخدام</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsage}</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="البحث بكود الكوبون..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الكود</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">نوع الخصم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">قيمة الخصم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الاستخدام</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">تاريخ الانتهاء</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCoupons.map(coupon => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-green-600">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded"><Copy className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {coupon.discountType === 'percentage' ? <><Percent className="w-4 h-4 text-green-600" /><span className="text-sm">نسبة مئوية</span></> : <><DollarSign className="w-4 h-4 text-blue-600" /><span className="text-sm">مبلغ ثابت</span></>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-gray-900">{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' جنيه'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{coupon.usedCount || 0} / {coupon.maxUses === 0 ? '∞' : coupon.maxUses}</td>
                    <td className="px-4 py-3">
                      {coupon.expiresAt ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{new Date(coupon.expiresAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.isActive && !isExpired(coupon.expiresAt) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"><CheckCircle className="w-3 h-3" />نشط</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"><XCircle className="w-3 h-3" />منتهي</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="تعديل"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد كوبونات</p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">كود الكوبون *</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono" placeholder="SUMMER2024" required disabled={!!editingCoupon} />
                    {!editingCoupon && <button type="button" onClick={generateCode} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">توليد</button>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">نوع الخصم *</label>
                    <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required>
                      <option value="percentage">نسبة مئوية</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">قيمة الخصم *</label>
                    <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="0" max={formData.discountType === 'percentage' ? '100' : undefined} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الحد الأقصى للاستخدام</label>
                    <input type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="0" placeholder="0 = غير محدود" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">تاريخ الانتهاء</label>
                    <input type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-green-600 rounded" />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">الكوبون نشط</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingCoupon ? 'تحديث' : 'إضافة'}</button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
