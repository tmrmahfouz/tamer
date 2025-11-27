'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

export default function AdminStatisticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadStatistics()
  }, [period])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success || data.user.role !== 'admin') {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/statistics?period=${period}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4" />
    if (growth < 0) return <ArrowDown className="w-4 h-4" />
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الإحصائيات المتقدمة</h1>
            <p className="text-gray-600">تحليل شامل لأداء المنصة</p>
          </div>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 font-semibold"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">هذا الربع</option>
            <option value="year">هذا العام</option>
            <option value="all">كل الوقت</option>
          </select>
        </div>
      </div>

      {stats && (
        <>
          {/* Main KPIs */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                {stats.revenue.growth !== 0 && (
                  <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {getGrowthIcon(stats.revenue.growth)}
                    <span>{Math.abs(stats.revenue.growth)}%</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(stats.revenue.total)}
              </div>
              <div className="text-sm opacity-90">إجمالي الإيرادات</div>
            </div>

            {/* Students */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                {stats.students.growth !== 0 && (
                  <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {getGrowthIcon(stats.students.growth)}
                    <span>{Math.abs(stats.students.growth)}%</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatNumber(stats.students.total)}
              </div>
              <div className="text-sm opacity-90">إجمالي الطلاب</div>
            </div>

            {/* Enrollments */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                {stats.enrollments.growth !== 0 && (
                  <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {getGrowthIcon(stats.enrollments.growth)}
                    <span>{Math.abs(stats.enrollments.growth)}%</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatNumber(stats.enrollments.total)}
              </div>
              <div className="text-sm opacity-90">التسجيلات</div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {stats.completionRate}%
              </div>
              <div className="text-sm opacity-90">معدل الإكمال</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">الإيرادات الشهرية</h2>
              <div className="space-y-4">
                {stats.revenueByMonth.map((item: any, index: number) => {
                  const maxRevenue = Math.max(...stats.revenueByMonth.map((i: any) => i.revenue))
                  const percentage = (item.revenue / maxRevenue) * 100

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.month}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">أفضل الدورات</h2>
              <div className="space-y-4">
                {stats.topCourses.map((course: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-600">
                        {formatNumber(course.enrollments)} تسجيل • {formatCurrency(course.revenue)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(course.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">طرق الدفع</h3>
              <div className="space-y-3">
                {stats.paymentMethods.map((method: any, index: number) => {
                  const total = stats.paymentMethods.reduce((sum: number, m: any) => sum + m.count, 0)
                  const percentage = ((method.count / total) * 100).toFixed(1)

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{method.method}</span>
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Course Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">التصنيفات</h3>
              <div className="space-y-3">
                {stats.categories.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm font-bold text-primary-600">
                      {formatNumber(category.count)} دورة
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">طلاب جدد</div>
                    <div className="text-xs text-gray-600">اليوم</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    +{stats.todayStats.newStudents}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">تسجيلات جديدة</div>
                    <div className="text-xs text-gray-600">اليوم</div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    +{stats.todayStats.newEnrollments}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">إيرادات اليوم</div>
                    <div className="text-xs text-gray-600">اليوم</div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(stats.todayStats.revenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">الاتجاهات</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.trends.averageOrderValue}
                </div>
                <div className="text-sm text-gray-600">متوسط قيمة الطلب</div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.trends.averageRating}
                </div>
                <div className="text-sm text-gray-600">متوسط التقييم</div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.trends.conversionRate}%
                </div>
                <div className="text-sm text-gray-600">معدل التحويل</div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.trends.activeUsers}
                </div>
                <div className="text-sm text-gray-600">مستخدمون نشطون</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
