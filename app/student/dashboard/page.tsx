'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContinueWatching from '@/components/ContinueWatching'
import LearningStats from '@/components/LearningStats'
import {
  BookOpen,
  Award,
  Clock,
  Play,
  CheckCircle,
  Target,
  Package,
} from 'lucide-react'

export default function StudentDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    certificates: 0,
    totalHours: 0,
  })
  const [purchasedBundles, setPurchasedBundles] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
    loadEnrollments()
    loadPurchasedBundles()
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

  const loadEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments)
        calculateStats(data.enrollments)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPurchasedBundles = async () => {
    try {
      const response = await fetch('/api/bundles/purchased')
      const data = await response.json()
      if (data.success) {
        setPurchasedBundles(data.bundles)
      }
    } catch (error) {
      console.error('Error loading bundles:', error)
    }
  }

  const calculateStats = (enrollments: any[]) => {
    const totalCourses = enrollments.length
    const inProgress = enrollments.filter((e) => e.completionPercentage < 100 && e.completionPercentage > 0).length
    const completed = enrollments.filter((e) => e.completionPercentage === 100).length
    const certificates = enrollments.filter((e) => e.certificateIssued).length
    
    // Calculate total hours (rough estimate)
    const totalHours = enrollments.reduce((sum, e) => {
      const duration = e.course.duration || '0'
      const hours = parseInt(duration.match(/\d+/)?.[0] || '0')
      return sum + hours
    }, 0)

    setStats({
      totalCourses,
      inProgress,
      completed,
      certificates,
      totalHours,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const recentCourses = enrollments.slice(0, 3)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-3 md:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              مرحباً، {user?.name} 👋
            </h1>
            <p className="text-sm md:text-base text-gray-600">استمر في رحلتك التعليمية</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Link href="/student/my-courses" className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                  <div className="text-xs md:text-sm text-gray-600">الدورات المسجلة</div>
                </div>
              </div>
            </Link>

            <Link href="/student/my-courses?filter=completed" className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.completed}</div>
                  <div className="text-xs md:text-sm text-gray-600">الدورات المكتملة</div>
                </div>
              </div>
            </Link>

            <Link href="/student/certificates" className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.certificates}</div>
                  <div className="text-xs md:text-sm text-gray-600">الشهادات</div>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalHours}</div>
                  <div className="text-xs md:text-sm text-gray-600">ساعات التعلم</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">استمر في التعلم</h2>
                  <Link
                    href="/student/my-courses"
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    عرض الكل ←
                  </Link>
                </div>

                {recentCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      ابدأ رحلتك التعليمية
                    </h3>
                    <p className="text-gray-600 mb-4">
                      استكشف دوراتنا وسجل في أول دورة لك
                    </p>
                    <Link href="/courses" className="btn-primary inline-block">
                      استكشف الدورات
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {recentCourses.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                            {enrollment.course.image}
                          </div>

                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 truncate">
                              {enrollment.course.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-600 to-secondary-600"
                                  style={{ width: `${enrollment.completionPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs md:text-sm font-semibold text-primary-600 whitespace-nowrap">
                                {enrollment.completionPercentage}%
                              </span>
                            </div>

                            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                                {enrollment.course.lessons} درس
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                {enrollment.course.duration}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => router.push(`/courses/${enrollment.course._id}`)}
                            className="btn-primary flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base px-4 py-2 w-full sm:w-auto whitespace-nowrap"
                          >
                            <Play className="w-3 h-3 md:w-4 md:h-4" />
                            <span>متابعة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning Goals */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">أهداف التعلم</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">إكمال 3 دورات</div>
                        <div className="text-sm text-gray-600">
                          {stats.completed} من 3 مكتملة
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((stats.completed / 3) * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">50 ساعة تعلم</div>
                        <div className="text-sm text-gray-600">
                          {stats.totalHours} ساعة مكتملة
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((stats.totalHours / 50) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Continue Watching */}
              <ContinueWatching />

              {/* Learning Stats */}
              <LearningStats />

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                <div className="space-y-2">
                  <Link
                    href="/courses"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    استكشف الدورات
                  </Link>
                  <Link
                    href="/student/my-courses"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    دوراتي
                  </Link>
                  <Link
                    href="/bundles"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    حزم الدورات
                  </Link>
                  <Link
                    href="/student/projects"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    مشاريعي
                  </Link>
                  <Link
                    href="/certificates"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    شهاداتي
                  </Link>
                  <Link
                    href="/profile"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                  >
                    الملف الشخصي
                  </Link>
                </div>
              </div>

              {/* Purchased Bundles */}
              {purchasedBundles.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary-600" />
                      حزمي المفعلة
                    </h3>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {purchasedBundles.length} حزمة
                    </span>
                  </div>
                  <div className="space-y-3">
                    {purchasedBundles.slice(0, 3).map((bundle) => (
                      <Link
                        key={bundle._id}
                        href={`/bundles/${bundle._id}`}
                        className="block p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors border border-primary-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-lg">
                            📦
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">
                              {bundle.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {bundle.courses?.length || 0} دورات
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {purchasedBundles.length > 3 && (
                      <Link
                        href="/student/my-bundles"
                        className="block text-center text-sm text-primary-600 hover:text-primary-700 font-semibold py-2"
                      >
                        عرض كل الحزم ({purchasedBundles.length}) ←
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-4">الإنجازات</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8" />
                    <div>
                      <div className="font-semibold">طالب نشط</div>
                      <div className="text-sm text-white/80">سجلت في {stats.totalCourses} دورات</div>
                    </div>
                  </div>
                  {stats.completed > 0 && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8" />
                      <div>
                        <div className="font-semibold">منجز</div>
                        <div className="text-sm text-white/80">أكملت {stats.completed} دورات</div>
                      </div>
                    </div>
                  )}
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
