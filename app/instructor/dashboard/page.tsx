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
  Clock,
  Package,
  FileQuestion,
  FolderKanban,
  MessageCircle
} from 'lucide-react'
import InstructorLayout from '@/components/InstructorLayout'

export default function InstructorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        if (data.user.role !== 'instructor' && data.user.role !== 'admin') {
          router.push('/student/dashboard')
          return
        }
        setUser(data.user)
        loadStats()
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
      const response = await fetch('/api/instructor/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (loading) {
    return (
      <InstructorLayout title="لوحة التحكم">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </InstructorLayout>
    )
  }

  const statsCards = [
    { title: 'دوراتي', value: stats.totalCourses, icon: BookOpen, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'طلابي', value: stats.totalStudents, icon: Users, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { title: 'الإيرادات', value: `${stats.totalRevenue.toLocaleString()} جنيه`, icon: DollarSign, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    { title: 'متوسط التقييم', value: stats.averageRating.toFixed(1), icon: Award, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  ]

  const quickActions = [
    { href: '/instructor/courses/new', label: 'إضافة دورة', icon: Plus, color: 'primary' },
    { href: '/instructor/courses', label: 'الدورات', icon: BookOpen, color: 'blue' },
    { href: '/instructor/quizzes', label: 'الاختبارات', icon: FileQuestion, color: 'green' },
    { href: '/instructor/projects', label: 'المشروعات', icon: FolderKanban, color: 'orange' },
    { href: '/instructor/students', label: 'الطلاب', icon: Users, color: 'indigo' },
    { href: '/instructor/bundles', label: 'الحزم', icon: Package, color: 'pink' },
    { href: '/instructor/community', label: 'المجتمع', icon: MessageCircle, color: 'teal' },
    { href: '/instructor/chat', label: 'الدردشة', icon: MessageCircle, color: 'cyan' },
  ]

  return (
    <InstructorLayout title="لوحة التحكم">
      <div>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            إليك نظرة عامة على دوراتك وطلابك
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
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-600">{stat.title}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  <span className="font-semibold text-gray-700 text-sm md:text-base">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </InstructorLayout>
  )
}
