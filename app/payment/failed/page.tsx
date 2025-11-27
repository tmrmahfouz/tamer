'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react'

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              فشلت عملية الدفع
            </h1>
            <p className="text-gray-600 mb-8">
              عذراً، لم نتمكن من إتمام عملية الدفع. الرجاء المحاولة مرة أخرى.
            </p>

            {/* Possible Reasons */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-right">
              <h3 className="font-bold text-gray-900 mb-4">الأسباب المحتملة:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>رصيد غير كافٍ في حسابك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>معلومات الدفع غير صحيحة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>مشكلة في الاتصال بالشبكة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>تم إلغاء العملية</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>إعادة المحاولة</span>
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>العودة للدورات</span>
              </button>
            </div>

            {/* Contact Support */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">تحتاج مساعدة؟</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                إذا استمرت المشكلة، يمكنك التواصل مع فريق الدعم
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
