'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Package, BookOpen, Tag, Clock, Users, Check, ShoppingCart } from 'lucide-react'

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

export default function BundleDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(true)

  useEffect(() => {
    if (id) {
      fetchBundle()
      checkAuth()
    }
  }, [id])

  // التحقق من شراء الحزمة بعد تحميل بيانات المستخدم والحزمة
  useEffect(() => {
    if (user && bundle) {
      checkBundlePurchase()
    } else {
      setCheckingPurchase(false)
    }
  }, [user, bundle])

  const fetchBundle = async () => {
    try {
      const res = await fetch(`/api/bundles/${id}`)
      const data = await res.json()
      if (data.success) {
        setBundle(data.bundle)
      }
    } catch (error) {
      console.error('Error fetching bundle:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      // Not logged in
    }
  }

  const checkBundlePurchase = async () => {
    if (!bundle || !user) {
      setCheckingPurchase(false)
      return
    }
    
    try {
      // التحقق من أن المستخدم مسجل في جميع دورات الحزمة
      const courseIds = bundle.courses.map(c => c._id)
      let allEnrolled = true
      
      for (const courseId of courseIds) {
        const res = await fetch(`/api/enrollments/check?courseId=${courseId}`)
        const data = await res.json()
        if (!data.isEnrolled) {
          allEnrolled = false
          break
        }
      }
      
      setIsPurchased(allEnrolled)
    } catch (error) {
      console.error('Error checking bundle purchase:', error)
    } finally {
      setCheckingPurchase(false)
    }
  }

  const handlePurchase = () => {
    if (!user) {
      router.push('/login?redirect=/bundles/' + id + '/checkout')
      return
    }
    // توجيه لصفحة الدفع الخاصة بالحزمة
    router.push(`/bundles/${id}/checkout`)
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

  if (!bundle) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">الحزمة غير موجودة</h2>
          <Link href="/bundles" className="btn-primary mt-4 inline-block">
            العودة للحزم
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
            <span>/</span>
            <Link href="/bundles" className="hover:text-primary-600">حزم الدورات</Link>
            <span>/</span>
            <span className="text-gray-900">{bundle.name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bundle Header */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="relative h-64 bg-gradient-to-r from-primary-600 to-secondary-600">
                  {bundle.image ? (
                    <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                  {bundle.discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      خصم {bundle.discountPercentage}%
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{bundle.name}</h1>
                  <p className="text-gray-600 text-lg">{bundle.description}</p>
                </div>
              </div>

              {/* Courses Included */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                  الدورات المشمولة ({bundle.courses.length} دورات)
                </h2>
                
                <div className="space-y-4">
                  {bundle.courses.map((course) => (
                    <div key={course._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-24 h-24 rounded-lg object-cover" />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-gray-400 line-through text-sm">{course.price} ج.م</span>
                          <span className="text-green-600 text-sm font-medium">مشمول في الحزمة</span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium self-center"
                      >
                        عرض الدورة
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">مميزات هذه الحزمة</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'وصول كامل لجميع الدورات',
                    'شهادات إتمام لكل دورة',
                    'دعم فني مستمر',
                    'تحديثات مجانية للمحتوى',
                    'وصول مدى الحياة',
                    'مجتمع تعليمي خاص',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary-600">{bundle.finalPrice} ج.م</span>
                    {bundle.discountPercentage > 0 && (
                      <span className="text-xl text-gray-400 line-through">{bundle.originalPrice} ج.م</span>
                    )}
                  </div>
                  {bundle.discountPercentage > 0 && (
                    <p className="text-green-600 font-medium">
                      توفير {bundle.originalPrice - bundle.finalPrice} ج.م
                    </p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      عدد الدورات
                    </span>
                    <span className="font-medium">{bundle.courses.length}</span>
                  </div>
                  {bundle.validUntil && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        ينتهي العرض
                      </span>
                      <span className="font-medium text-red-600">
                        {new Date(bundle.validUntil).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                  {bundle.maxPurchases && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        الكمية المتبقية
                      </span>
                      <span className="font-medium">
                        {bundle.maxPurchases - bundle.currentPurchases} من {bundle.maxPurchases}
                      </span>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                {checkingPurchase ? (
                  <div className="w-full py-4 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : isPurchased ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 font-semibold">تم شراء هذه الحزمة</p>
                    </div>
                    <Link
                      href="/student/dashboard"
                      className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      عرض دوراتي
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handlePurchase}
                      className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      اشترِ الحزمة الآن
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-4">
                      ضمان استرداد الأموال خلال 7 أيام
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
