'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { CheckCircle, ArrowLeft, Download } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentId = searchParams.get('paymentId')
    if (paymentId) {
      loadPayment(paymentId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const loadPayment = async (paymentId: string) => {
    try {
      setPayment({
        _id: paymentId,
        amount: 499,
        method: 'vodafone-cash',
        referenceNumber: `REF-${Date.now()}`,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تم الدفع بنجاح! 🎉</h1>
          <p className="text-gray-600 mb-8">شكراً لك! تم تسجيلك في الدورة بنجاح</p>
          {payment && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-right">
              <h3 className="font-bold text-gray-900 mb-4">تفاصيل العملية</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم المرجع:</span>
                  <span className="font-semibold text-gray-900">{payment.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-semibold text-gray-900">{payment.amount} جنيه</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => router.push('/student/my-courses')} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <span>ابدأ التعلم</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={() => window.print()} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              <span>طباعة الإيصال</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  )
}
