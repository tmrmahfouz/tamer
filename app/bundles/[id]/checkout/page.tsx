'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Check,
  Upload,
  ArrowRight,
  Tag,
  Package,
  BookOpen,
} from 'lucide-react'

interface Course {
  _id: string
  title: string
  price: number
}

interface Bundle {
  _id: string
  name: string
  description: string
  courses: Course[]
  originalPrice: number
  discountPercentage: number
  finalPrice: number
}

export default function BundleCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const bundleId = params.id as string

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [gateways, setGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadBundle()
    loadGateways()
  }, [bundleId])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
      } else {
        router.push(`/login?redirect=/bundles/${bundleId}/checkout`)
      }
    } catch {
      router.push(`/login?redirect=/bundles/${bundleId}/checkout`)
    }
  }

  const loadBundle = async () => {
    try {
      const res = await fetch(`/api/bundles/${bundleId}`)
      const data = await res.json()
      if (data.success) {
        setBundle(data.bundle)
      } else {
        router.push('/bundles')
      }
    } catch (error) {
      console.error('Error loading bundle:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGateways = async () => {
    try {
      const res = await fetch('/api/payment-gateways')
      const data = await res.json()
      if (data.success) {
        setGateways(data.gateways)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGateway) {
      alert('الرجاء اختيار طريقة الدفع')
      return
    }

    try {
      setSubmitting(true)

      let proofBase64 = ''
      if (paymentProof) {
        const reader = new FileReader()
        proofBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(paymentProof)
        })
      }

      const payload = {
        bundleId: bundleId,
        type: 'bundle',
        paymentMethod: selectedGateway,
        amount: bundle?.finalPrice,
        originalAmount: bundle?.originalPrice,
        discount: (bundle?.originalPrice || 0) - (bundle?.finalPrice || 0),
        phoneNumber: phoneNumber || '',
        referenceNumber: referenceNumber || '',
        paymentProof: proofBase64
      }

      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ تم إرسال طلب الدفع بنجاح! سيتم مراجعته من قبل الإدارة.')
        router.push('/dashboard')
      } else {
        alert('❌ خطأ: ' + data.message)
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
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  if (!bundle) return null

  const selectedGatewayData = gateways.find(g => g._id === selectedGateway)


  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href={`/bundles/${bundleId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة للحزمة</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bundle Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary-600" />
                  ملخص الحزمة
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{bundle.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{bundle.courses.length} دورات مشمولة</span>
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">طرق الدفع</h2>
                {gateways.length === 0 ? (
                  <div className="p-8 text-center bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 font-semibold">⚠️ لا توجد طرق دفع متاحة حالياً</p>
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

              {/* Payment Details Form */}
              {selectedGatewayData && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الدفع</h2>

                  {/* Gateway Info */}
                  <div className="space-y-3 mb-6">
                    {selectedGatewayData.config?.accountNumber && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">رقم الحساب</div>
                        <div className="font-mono text-lg font-bold">{selectedGatewayData.config.accountNumber}</div>
                      </div>
                    )}
                    {selectedGatewayData.config?.accountName && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">اسم الحساب</div>
                        <div className="font-bold">{selectedGatewayData.config.accountName}</div>
                      </div>
                    )}
                  </div>

                  {selectedGatewayData.config?.instructions && (
                    <div className="p-4 bg-blue-50 border-r-4 border-blue-400 rounded-lg mb-6">
                      <div className="font-bold text-blue-900 mb-2">📝 التعليمات</div>
                      <p className="text-blue-800 text-sm">{selectedGatewayData.config.instructions}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">رقم الهاتف المستخدم في الدفع</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
                        placeholder="01012345678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">رقم المرجع / رقم العملية</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
                        placeholder="123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">صورة إيصال الدفع</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label htmlFor="payment-proof" className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold">
                          اضغط لاختيار صورة
                        </label>
                        {paymentProof && (
                          <div className="mt-2 text-sm text-green-600">✓ تم اختيار: {paymentProof.name}</div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                      {submitting ? 'جاري الإرسال...' : 'إرسال طلب الدفع'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">ملخص الدفع</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">السعر الأصلي</span>
                    <span className="text-gray-400 line-through">{bundle.originalPrice} ج.م</span>
                  </div>
                  {bundle.discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم ({bundle.discountPercentage}%)</span>
                      <span className="font-bold">- {bundle.originalPrice - bundle.finalPrice} ج.م</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold text-primary-600">{bundle.finalPrice} ج.م</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">ضمان استرداد الأموال</p>
                      <p>يمكنك استرداد أموالك خلال 7 أيام</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
