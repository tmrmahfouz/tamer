'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Plus,
  TrendingUp,
  Award,
  DollarSign,
  Bell,
  CreditCard,
  CheckCircle,
  Clock,
  UserPlus,
  Package,
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        
        if (data.user.role === 'student') {
          router.push('/student/dashboard')
          return
        }
        
        if (data.user.role === 'instructor') {
          router.push('/instructor/dashboard')
          return
        }
        
        // Only admin continues here
        loadStats()
        loadNotifications()
        loadRecentActivity()
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        const totalStudents = data.courses.reduce((sum: number, course: any) => sum + course.students, 0)
        const totalRevenue = data.courses.reduce((sum: number, course: any) => sum + (course.price * course.students), 0)
        const avgRating = data.courses.reduce((sum: number, course: any) => sum + course.rating, 0) / data.courses.length || 0

        setStats({
          totalCourses: data.courses.length,
          totalStudents,
          totalRevenue,
          averageRating: avgRating,
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/dashboard/activity')
      const data = await response.json()
      if (data.success) {
        setRecentActivity(data.activities || [])
      }
    } catch (error) {
      console.error('Error loading activity:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  const statsCards = [
    {
      title: 'إجمالي الدورات',
      value: stats.totalCourses,
      icon: BookOpen,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'إجمالي الطلاب',
      value: stats.totalStudents,
      icon: Users,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'الإيرادات',
      value: `${stats.totalRevenue.toLocaleString()} جنيه`,
      icon: DollarSign,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'متوسط التقييم',
      value: stats.averageRating.toFixed(1),
      icon: Award,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ]

  return (
    <AdminLayout title="لوحة التحكم">
      <div>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            إليك نظرة عامة على منصتك التعليمية
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-600">{stat.title}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link
              href="/dashboard/courses/new"
              className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              <span className="font-semibold text-gray-700 text-sm md:text-base">إضافة دورة</span>
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
            >
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              <span className="font-semibold text-gray-700 text-sm md:text-base">الدورات</span>
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/admin/enrollments"
                  className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  <span className="font-semibold text-gray-700 text-sm md:text-base">التسجيلات</span>
                  {notifications.filter(n => n.type === 'enrollment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'enrollment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/payments"
                  className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <span className="font-semibold text-gray-700 text-sm md:text-base">المدفوعات</span>
                  {notifications.filter(n => n.type === 'payment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'payment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/students"
                  className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                  <span className="font-semibold text-gray-700 text-sm md:text-base">الطلاب</span>
                </Link>
                <Link
                  href="/dashboard/admin/bundles"
                  className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition-all"
                >
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
                  <span className="font-semibold text-gray-700 text-sm md:text-base">الحزم</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">النشاط الأخير</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'enrollment':
                      return { icon: Users, color: 'green' }
                    case 'payment':
                      return { icon: DollarSign, color: 'purple' }
                    case 'course':
                      return { icon: BookOpen, color: 'blue' }
                    case 'completion':
                      return { icon: CheckCircle, color: 'green' }
                    default:
                      return { icon: Bell, color: 'gray' }
                  }
                }
                
                const { icon: Icon, color } = getActivityIcon()
                
                return (
                  <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 md:w-10 md:h-10 bg-${color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 text-${color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{activity.title}</div>
                      <div className="text-xs md:text-sm text-gray-600 truncate">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                      {activity.time}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا يوجد نشاط حديث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
