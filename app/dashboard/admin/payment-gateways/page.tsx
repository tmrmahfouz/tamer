'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Smartphone,
  Building,
  Wallet,
} from 'lucide-react'

export default function PaymentGatewaysPage() {
  const router = useRouter()
  const [gateways, setGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGateway, setEditingGateway] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'vodafone_cash' as 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_transfer' | 'wallet',
    isActive: true,
    accountNumber: '',
    accountName: '',
    bankName: '',
    iban: '',
    instructions: '',
    feesType: 'percentage' as 'percentage' | 'fixed',
    feesValue: 0,
    minAmount: 0,
    maxAmount: 0,
  })

  useEffect(() => {
    checkAuth()
    loadGateways()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success || data.user.role !== 'admin') {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payment-gateways')
      const data = await response.json()

      if (data.success) {
        setGateways(data.gateways)
      } else {
        console.error('Failed to load gateways:', data.message)
      }
    } catch (error) {
      console.error('Error loading gateways:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGateway = async () => {
    try {
      const url = editingGateway
        ? `/api/payment-gateways/${editingGateway._id}`
        : '/api/payment-gateways'

      const method = editingGateway ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        setShowModal(false)
        setEditingGateway(null)
        loadGateways() // Reload gateways
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving gateway:', error)
      alert('حدث خطأ أثناء الحفظ')
    }
  }

  const getGatewayIcon = (type: string) => {
    const icons: any = {
      vodafone_cash: Smartphone,
      instapay: CreditCard,
      fawry: Building,
      bank_transfer: Building,
      wallet: Wallet,
    }
    return icons[type] || CreditCard
  }

  const getGatewayColor = (type: string) => {
    const colors: any = {
      vodafone_cash: 'from-red-500 to-red-600',
      instapay: 'from-blue-500 to-blue-600',
      fawry: 'from-orange-500 to-orange-600',
      bank_transfer: 'from-green-500 to-green-600',
      wallet: 'from-purple-500 to-purple-600',
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">بوابات الدفع</h1>
        <p className="text-gray-600">إدارة طرق الدفع المتاحة للطلاب</p>
      </div>

      {/* Gateways Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gateway) => {
          const Icon = getGatewayIcon(gateway.type)
          const colorClass = getGatewayColor(gateway.type)

          return (
            <div key={gateway._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${colorClass} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-12 h-12" />
                  {gateway.isActive ? (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      نشط
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold flex items-center gap-1">
                      <X className="w-4 h-4" />
                      غير نشط
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold">{gateway.name}</h3>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {gateway.config.accountNumber && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">رقم الحساب</div>
                      <div className="font-mono font-bold text-gray-900">
                        {gateway.config.accountNumber}
                      </div>
                    </div>
                  )}

                  {gateway.config.accountName && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">اسم الحساب</div>
                      <div className="font-semibold text-gray-900">
                        {gateway.config.accountName}
                      </div>
                    </div>
                  )}

                  {gateway.config.bankName && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">البنك</div>
                      <div className="font-semibold text-gray-900">
                        {gateway.config.bankName}
                      </div>
                    </div>
                  )}

                  {gateway.config.iban && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">IBAN</div>
                      <div className="font-mono text-sm text-gray-900">
                        {gateway.config.iban}
                      </div>
                    </div>
                  )}

                  {gateway.config.merchantCode && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">كود التاجر</div>
                      <div className="font-mono font-bold text-gray-900">
                        {gateway.config.merchantCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {gateway.config.instructions && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="text-xs text-gray-600 mb-2">التعليمات</div>
                    <div className="text-sm text-gray-900">
                      {gateway.config.instructions}
                    </div>
                  </div>
                )}

                {/* Fees */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">الرسوم</span>
                  <span className="font-bold text-blue-600">
                    {gateway.fees.value}
                    {gateway.fees.type === 'percentage' ? '%' : ' جنيه'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-2">
                <button
                  onClick={() => {
                    setEditingGateway(gateway)
                    setFormData({
                      name: gateway.name,
                      type: gateway.type,
                      isActive: gateway.isActive,
                      accountNumber: gateway.config.accountNumber || '',
                      accountName: gateway.config.accountName || '',
                      bankName: gateway.config.bankName || '',
                      iban: gateway.config.iban || '',
                      instructions: gateway.config.instructions || '',
                      feesType: gateway.fees.type,
                      feesValue: gateway.fees.value,
                      minAmount: gateway.minAmount || 0,
                      maxAmount: gateway.maxAmount || 0,
                    })
                    setShowModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State - Show when no gateways */}
      {gateways.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد بوابات دفع</h3>
          <p className="text-gray-600 mb-6">لم يتم إعداد بوابات الدفع بعد. يمكنك إنشاء البوابات الافتراضية.</p>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/payment-gateways/seed', { method: 'POST' })
                const data = await res.json()
                if (data.success) {
                  alert('تم إنشاء بوابات الدفع بنجاح!')
                  loadGateways()
                } else {
                  alert(data.message || 'حدث خطأ')
                }
              } catch (error) {
                alert('حدث خطأ أثناء إنشاء البوابات')
              }
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إنشاء بوابات الدفع الافتراضية
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-r-4 border-blue-400 p-6 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">💡 ملاحظة هامة</h3>
        <p className="text-blue-800 text-sm">
          بوابات الدفع المعروضة هي طرق الدفع المتاحة للطلاب. يمكنك تعديل معلومات كل بوابة حسب احتياجاتك.
          للتكامل الكامل مع APIs بوابات الدفع، يرجى التواصل مع مزود الخدمة للحصول على مفاتيح API.
        </p>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingGateway ? 'تعديل بوابة الدفع' : 'إضافة بوابة دفع'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingGateway(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم البوابة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="مثال: فودافون كاش"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نوع البوابة *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="instapay">انستاباي</option>
                  <option value="fawry">فوري</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="wallet">محفظة إلكترونية</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رقم الحساب
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="01012345678"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الحساب
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="تامر محفوظ"
                />
              </div>

              {/* Bank Name */}
              {formData.type === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم البنك
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      placeholder="البنك الأهلي المصري"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      placeholder="EG380002000156789012345678901"
                    />
                  </div>
                </>
              )}

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  التعليمات
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="أدخل التعليمات للطلاب..."
                />
              </div>

              {/* Fees */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    نوع الرسوم
                  </label>
                  <select
                    value={formData.feesType}
                    onChange={(e) => setFormData({ ...formData, feesType: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    قيمة الرسوم
                  </label>
                  <input
                    type="number"
                    value={formData.feesValue}
                    onChange={(e) => setFormData({ ...formData, feesValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  تفعيل البوابة
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingGateway(null)
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveGateway}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
