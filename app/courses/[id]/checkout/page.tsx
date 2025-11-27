'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Check,
  Upload,
  ArrowRight,
  Tag,
} from 'lucide-react'
import CouponInput from '@/components/CouponInput'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gateways, setGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState('')

  const loadCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${courseId}`)
      const data = await response.json()

      if (data.success) {
        setCourse(data.course)
      } else {
        alert('الدورة غير موجودة')
        router.push('/courses')
      }
    } catch (error) {
      console.error('Error loading course:', error)
      alert('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const loadGateways = async () => {
    try {
      const response = await fetch('/api/payment-gateways')
      const data = await response.json()

      console.log('Payment gateways response:', data)

      if (data.success) {
        console.log('Loaded gateways:', data.gateways)
        setGateways(data.gateways)
      } else {
        console.error('Failed to load gateways:', data.message)
      }
    } catch (error) {
      console.error('Error loading gateways:', error)
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

  useEffect(() => {
    loadCourse()
    loadGateways()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGateway) {
      alert('الرجاء اختيار طريقة الدفع')
      return
    }

    try {
      setSubmitting(true)

      // Convert file to base64 if exists
      let proofBase64 = ''
      if (paymentProof) {
        const reader = new FileReader()
        proofBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(paymentProof)
        })
      }

      const finalAmount = course.price - discount
      const payload = {
        courseId: courseId,
        paymentMethod: selectedGateway,
        amount: finalAmount,
        originalAmount: course.price,
        discount: discount,
        phoneNumber: phoneNumber || '',
        referenceNumber: referenceNumber || '',
        paymentProof: proofBase64
      }

      console.log('Sending payment request:', payload)

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('Response from API:', data)
      console.log('Response status:', response.status)

      if (data.success) {
        alert('✅ تم إرسال طلب الدفع بنجاح! سيتم مراجعته من قبل الإدارة.')
        router.push('/dashboard')
      } else {
        console.error('Error response:', data)
        alert('❌ خطأ: ' + data.message + '\n\nStatus: ' + response.status + '\n\nانظر Console للتفاصيل')
      }
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const selectedGatewayData = gateways.find(g => g._id === selectedGateway)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إتمام الدفع</h1>
          <p className="text-gray-600">اختر طريقة الدفع المناسبة لك</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.instructor?.name}</p>
                </div>
                <div className="text-left">
                  {discount > 0 ? (
                    <div>
                      <div className="text-sm text-gray-500 line-through">{course.price} جنيه</div>
                      <div className="text-2xl font-bold text-green-600">
                        {course.price - discount} جنيه
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-primary-600">
                      {course.price} جنيه
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">كود الخصم</h2>
              </div>
              <CouponInput
                courseId={courseId}
                originalPrice={course.price}
                onApply={(discountAmount) => {
                  setDiscount(discountAmount)
                }}
              />
              {discount > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-semibold">🎉 تم تطبيق الخصم</span>
                    <span className="text-green-600 font-bold">- {discount} جنيه</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Gateways */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">طرق الدفع</h2>
              {gateways.length === 0 ? (
                <div className="p-8 text-center bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <p className="text-yellow-800 font-semibold mb-2">⚠️ لا توجد طرق دفع متاحة حالياً</p>
                  <p className="text-yellow-700 text-sm">يرجى التواصل مع الإدارة أو المحاولة لاحقاً</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {gateways.map((gateway) => {
                    const Icon = getGatewayIcon(gateway.type)
                    const colorClass = getGatewayColor(gateway.type)
                    return (
                      <button
                        key={gateway._id}
                        onClick={() => setSelectedGateway(gateway._id)}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          selectedGateway === gateway._id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-bold text-gray-900">{gateway.name}</div>
                          </div>
                          {selectedGateway === gateway._id && (
                            <Check className="w-6 h-6 text-primary-600" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment Details */}
            {selectedGatewayData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الدفع</h2>

                {/* Gateway Info */}
                <div className="space-y-3 mb-6">
                  {selectedGatewayData.config?.accountNumber && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">رقم الحساب</div>
                      <div className="font-mono text-lg font-bold text-gray-900">
                        {selectedGatewayData.config.accountNumber}
                      </div>
                    </div>
                  )}

                  {selectedGatewayData.config?.accountName && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">اسم الحساب</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedGatewayData.config.accountName}
                      </div>
                    </div>
                  )}

                  {selectedGatewayData.config?.bankName && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">البنك</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedGatewayData.config.bankName}
                      </div>
                    </div>
                  )}

                  {selectedGatewayData.config?.iban && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">IBAN</div>
                      <div className="font-mono text-sm text-gray-900">
                        {selectedGatewayData.config.iban}
                      </div>
                    </div>
                  )}

                  {selectedGatewayData.config?.merchantCode && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">كود التاجر</div>
                      <div className="font-mono text-lg font-bold text-gray-900">
                        {selectedGatewayData.config.merchantCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {selectedGatewayData.config?.instructions && (
                  <div className="p-4 bg-blue-50 border-r-4 border-blue-400 rounded-lg mb-6">
                    <div className="font-bold text-blue-900 mb-2">📝 التعليمات</div>
                    <p className="text-blue-800 text-sm">
                      {selectedGatewayData.config.instructions}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      رقم الهاتف المستخدم في الدفع
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      placeholder="01012345678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      رقم المرجع / رقم العملية
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      صورة إيصال الدفع
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                        className="hidden"
                        id="payment-proof"
                      />
                      <label
                        htmlFor="payment-proof"
                        className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        اضغط لاختيار صورة
                      </label>
                      {paymentProof && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ تم اختيار: {paymentProof.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'جاري الإرسال...' : 'إرسال طلب الدفع'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">ملخص الدفع</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">سعر الدورة</span>
                  <span className="font-bold text-gray-900">{course.price} جنيه</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span className="font-bold">- {discount} جنيه</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">الرسوم</span>
                  <span className="font-bold text-gray-900">0 جنيه</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">الإجمالي</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {course.price - discount} جنيه
                  </span>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">ضمان استرداد الأموال</p>
                    <p>يمكنك استرداد أموالك خلال 14 يوم إذا لم تكن راضياً عن الدورة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
