'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Package, BookOpen, Tag, Clock, Users, ArrowLeft } from 'lucide-react'

interface Course {
  _id: string
  title: string
  price: number
  thumbnail: string
  description: string
}

interface Bundle {
  _id: string
  name: string
  description: string
  image: string
  courses: Course[]
  originalPrice: number
  discountPercentage: number
  finalPrice: number
  validUntil?: string
  maxPurchases?: number
  currentPurchases: number
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/bundles')
      const data = await res.json()
      if (data.success) {
        setBundles(data.bundles)
      }
    } catch (error) {
      console.error('Error fetching bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRemainingTime = (validUntil: string) => {
    const end = new Date(validUntil)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days} يوم متبقي`
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours > 0) return `${hours} ساعة متبقية`
    return 'ينتهي قريباً'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
              <Package className="w-5 h-5" />
              <span className="font-semibold">عروض خاصة</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">حزم الدورات</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              وفّر أكثر مع حزم الدورات المجمعة! احصل على مجموعة دورات بسعر مخفض
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد حزم متاحة حالياً</h3>
              <p className="text-gray-500 mb-6">تابعنا للحصول على أحدث العروض</p>
              <Link href="/courses" className="btn-primary">
                تصفح الدورات
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {bundles.map((bundle) => (
                <div key={bundle._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                  {/* Bundle Image */}
                  <div className="relative h-48 bg-gradient-to-r from-primary-600 to-secondary-600">
                    {bundle.image ? (
                      <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-white/50" />
                      </div>
                    )}
                    {bundle.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        خصم {bundle.discountPercentage}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h2>
                    <p className="text-gray-600 mb-4">{bundle.description}</p>
                    
                    {/* Courses List */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        الدورات المشمولة ({bundle.courses.length})
                      </h4>
                      <div className="space-y-2">
                        {bundle.courses.slice(0, 3).map((course) => (
                          <div key={course._id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                            {course.thumbnail && (
                              <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded object-cover" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{course.title}</p>
                              <p className="text-gray-500 text-xs">{course.price} ج.م</p>
                            </div>
                          </div>
                        ))}
                        {bundle.courses.length > 3 && (
                          <p className="text-primary-600 text-sm font-medium">
                            + {bundle.courses.length - 3} دورات أخرى
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                      {bundle.validUntil && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getRemainingTime(bundle.validUntil)}
                        </span>
                      )}
                      {bundle.maxPurchases && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          متبقي {bundle.maxPurchases - bundle.currentPurchases} من {bundle.maxPurchases}
                        </span>
                      )}
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-primary-600">{bundle.finalPrice} ج.م</span>
                          {bundle.discountPercentage > 0 && (
                            <span className="text-gray-400 line-through">{bundle.originalPrice} ج.م</span>
                          )}
                        </div>
                        {bundle.discountPercentage > 0 && (
                          <p className="text-green-600 text-sm font-medium">
                            توفير {bundle.originalPrice - bundle.finalPrice} ج.م
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/bundles/${bundle._id}`}
                        className="btn-primary flex items-center gap-2"
                      >
                        <span>عرض التفاصيل</span>
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
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
