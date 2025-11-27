'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Award,
  MessageSquare,
  Video,
  FileText,
  Activity,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

export default function AdminOverviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

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

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/overview')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم المتقدمة">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  const quickStats = [
    {
      title: 'إجمالي الإيرادات',
      value: stats?.revenue?.total || 0,
      format: 'currency',
      change: stats?.revenue?.growth || 0,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      link: '/dashboard/admin/payments',
    },
    {
      title: 'إجمالي الطلاب',
      value: stats?.students?.total || 0,
      format: 'number',
      change: stats?.students?.growth || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      link: '/dashboard/admin/students',
    },
    {
      title: 'إجمالي الدورات',
      value: stats?.courses?.total || 0,
      format: 'number',
      change: stats?.courses?.growth || 0,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      link: '/dashboard/courses',
    },
    {
      title: 'إجمالي التسجيلات',
      value: stats?.enrollments?.total || 0,
      format: 'number',
      change: stats?.enrollments?.growth || 0,
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      link: '/dashboard/admin/enrollments',
    },
  ]

  const recentActivities = [
    {
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      title: 'طلاب جدد',
      value: stats?.today?.newStudents || 0,
      time: 'اليوم',
    },
    {
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100',
      title: 'تسجيلات جديدة',
      value: stats?.today?.newEnrollments || 0,
      time: 'اليوم',
    },
    {
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
      title: 'مدفوعات معلقة',
      value: stats?.pending?.payments || 0,
      time: 'تحتاج مراجعة',
    },
    {
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100',
      title: 'تذاكر دعم مفتوحة',
      value: stats?.pending?.tickets || 0,
      time: 'تحتاج رد',
    },
  ]

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return `${value.toLocaleString('ar-EG')} جنيه`
    }
    return value.toLocaleString('ar-EG')
  }

  return (
    <AdminLayout title="لوحة التحكم المتقدمة">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
        </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0

          return (
            <Link key={index} href={stat.link}>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatValue(stat.value, stat.format)}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">النشاط الأخير</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{activity.title}</div>
                      <div className="text-xs text-gray-600">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{activity.value}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
          <div className="space-y-3">
            <Link href="/dashboard/admin/students">
              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-right">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">إدارة الطلاب</span>
              </button>
            </Link>
            <Link href="/dashboard/courses/create">
              <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-right">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">إضافة دورة جديدة</span>
              </button>
            </Link>
            <Link href="/dashboard/admin/payments">
              <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-right">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">مراجعة المدفوعات</span>
              </button>
            </Link>
            <Link href="/dashboard/admin/coupons">
              <button className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-right">
                <Award className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">إدارة الكوبونات</span>
              </button>
            </Link>
            <Link href="/dashboard/support">
              <button className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-right">
                <MessageSquare className="w-5 h-5 text-pink-600" />
                <span className="font-semibold text-gray-900">الدعم الفني</span>
              </button>
            </Link>
            <Link href="/dashboard/admin/reports">
              <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-right">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">التقارير</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">الإيرادات الشهرية</h2>
          <div className="space-y-4">
            {stats?.revenueChart?.map((item: any, index: number) => {
              const maxRevenue = Math.max(...(stats?.revenueChart?.map((i: any) => i.value) || [1]))
              const percentage = (item.value / maxRevenue) * 100

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.value.toLocaleString('ar-EG')} جنيه
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
            {stats?.topCourses?.map((course: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{course.title}</div>
                  <div className="text-sm text-gray-600">
                    {course.enrollments} طالب • {course.revenue.toLocaleString('ar-EG')} جنيه
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">حالة النظام</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">نشط</div>
            <div className="text-sm text-gray-600">حالة الخادم</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats?.online?.users || 0}</div>
            <div className="text-sm text-gray-600">مستخدمون متصلون</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats?.live?.sessions || 0}</div>
            <div className="text-sm text-gray-600">جلسات مباشرة</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
            <div className="text-sm text-gray-600">وقت التشغيل</div>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
