'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Award, Download, Share2, CheckCircle, Calendar } from 'lucide-react'

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      const data = await response.json()

      if (data.success) {
        setCertificates(data.certificates || [])
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        // في حالة أي خطأ آخر، نعرض قائمة فارغة
        setCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error('Error loading certificates:', error)
      setCertificates([])
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
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">شهاداتي</h1>
            <p className="text-gray-600">جميع الشهادات التي حصلت عليها</p>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد شهادات بعد
              </h3>
              <p className="text-gray-600 mb-6">
                أكمل الدورات للحصول على الشهادات
              </p>
              <button
                onClick={() => router.push('/student/my-courses')}
                className="btn-primary"
              >
                دوراتي
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {certificates.map((cert) => {
                const course = cert.course as any
                return (
                  <div
                    key={cert._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Certificate Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-3xl">
                          {course.image}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(cert.issuedAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>رقم الشهادة: {cert.certificateNumber}</span>
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-1">الدرجة النهائية</div>
                        <div className="text-3xl font-bold text-primary-600">
                          {cert.grade}%
                        </div>
                      </div>

                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          كود التحقق
                        </div>
                        <div className="font-mono text-lg font-bold text-gray-900">
                          {cert.verificationCode}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/certificates/${cert._id}`)}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>عرض</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="تحميل"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/certificates/verify/${cert.verificationCode}`
                            navigator.clipboard.writeText(url)
                            alert('تم نسخ رابط التحقق')
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="مشاركة"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
