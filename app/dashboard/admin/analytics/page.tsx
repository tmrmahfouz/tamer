'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Users, BookOpen, Calendar, PieChart, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="التحليلات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="التحليلات">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              التحليلات والإحصائيات
            </h1>
            <p className="text-gray-600">
              نظرة شاملة على أداء المنصة
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:outline-none"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
            <option value="all">كل الوقت</option>
          </select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-sm opacity-90">إجمالي الإيرادات</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {analytics?.revenue?.total?.toLocaleString() || 0} جنيه
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>+{analytics?.revenue?.growth || 0}% من الفترة السابقة</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-sm opacity-90">الطلاب الجدد</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {analytics?.students?.new || 0}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>إجمالي: {analytics?.students?.total || 0}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-sm opacity-90">التسجيلات الجديدة</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {analytics?.enrollments?.new || 0}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>إجمالي: {analytics?.enrollments?.total || 0}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <span className="text-sm opacity-90">الدورات النشطة</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {analytics?.courses?.active || 0}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>إجمالي: {analytics?.courses?.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-primary-600" />
              توزيع الإيرادات
            </h2>
            <div className="space-y-4">
              {analytics?.revenueByMethod?.map((method: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{method.name}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {method.amount?.toLocaleString()} جنيه
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              أفضل الدورات مبيعاً
            </h2>
            <div className="space-y-4">
              {analytics?.topCourses?.map((course: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {course.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.enrollments} تسجيل • {course.revenue?.toLocaleString()} جنيه
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              معدل التحويل
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {analytics?.conversionRate || 0}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  من الزوار إلى طلاب
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              متوسط سعر الدورة
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {analytics?.averageCoursePrice?.toLocaleString() || 0} جنيه
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متوسط الإيراد لكل تسجيل
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              معدل الإكمال
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {analytics?.completionRate || 0}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  من الطلاب أكملوا الدورات
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
