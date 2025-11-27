'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Award, Download, Share2, Calendar, BookOpen, ArrowLeft } from 'lucide-react'

export default function CertificatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadCertificates()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      const data = await response.json()

      if (data.success) {
        setCertificates(data.certificates)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (certificateId: string) => {
    // TODO: Implement certificate download
    alert('سيتم إضافة خاصية تحميل الشهادة قريباً')
  }

  const handleShare = (certificateId: string) => {
    // TODO: Implement certificate sharing
    alert('سيتم إضافة خاصية مشاركة الشهادة قريباً')
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
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للوحة التحكم</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              شهاداتي 🏆
            </h1>
            <p className="text-gray-600">جميع الشهادات التي حصلت عليها</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
                  <div className="text-sm text-gray-600">إجمالي الشهادات</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
                  <div className="text-sm text-gray-600">دورات مكتملة</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date().getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600">السنة الحالية</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Award className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد شهادات بعد
              </h3>
              <p className="text-gray-600 mb-6">
                أكمل دوراتك للحصول على الشهادات
              </p>
              <Link href="/student/my-courses" className="btn-primary inline-block">
                عرض دوراتي
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Certificate Preview */}
                  <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 p-8 aspect-[4/3] flex items-center justify-center">
                    <div className="text-center">
                      <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        شهادة إتمام
                      </h3>
                      <p className="text-sm text-gray-600">{cert.course?.title}</p>
                    </div>
                    
                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-yellow-400"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-yellow-400"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-yellow-400"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-yellow-400"></div>
                  </div>

                  {/* Certificate Info */}
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {cert.course?.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    {cert.certificateNumber && (
                      <div className="text-xs text-gray-500 mb-4">
                        رقم الشهادة: {cert.certificateNumber}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/certificates/${cert._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>عرض الشهادة</span>
                      </Link>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/certificates/verify/${cert.verificationCode}`
                          navigator.clipboard.writeText(url)
                          alert('تم نسخ رابط التحقق!')
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="نسخ رابط التحقق"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
