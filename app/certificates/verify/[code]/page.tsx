'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircle, XCircle, Award, Calendar } from 'lucide-react'

export default function VerifyCertificatePage() {
  const params = useParams()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyCertificate()
  }, [])

  const verifyCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/verify/${params.code}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'حدث خطأ أثناء التحقق' })
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
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {result.success && result.valid ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  شهادة موثقة ✓
                </h1>
                <p className="text-gray-600 mb-8">
                  هذه الشهادة صحيحة وموثقة من منصتنا
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
                  <h3 className="font-bold text-gray-900 mb-4">تفاصيل الشهادة</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الشهادة:</span>
                      <span className="font-semibold text-gray-900">
                        {result.certificate.certificateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم الطالب:</span>
                      <span className="font-semibold text-gray-900">
                        {result.certificate.studentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم الدورة:</span>
                      <span className="font-semibold text-gray-900">
                        {result.certificate.courseName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإصدار:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(result.certificate.issuedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">تم التحقق بنجاح</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  شهادة غير صحيحة
                </h1>
                <p className="text-gray-600 mb-8">
                  {result.message || 'لم نتمكن من التحقق من هذه الشهادة'}
                </p>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-right">
                  <p className="text-sm text-red-700">
                    <strong>ملاحظة:</strong> إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
