'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  Award,
  DollarSign,
  Bell,
  CreditCard,
  FileText,
  BarChart3,
  UserPlus,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  FileQuestion,
  User,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  Package,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
        
        // Check if user is admin or instructor
        if (data.user.role !== 'admin' && data.user.role !== 'instructor') {
          router.push('/student/dashboard')
          return
        }
        
        // Load stats
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('user')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'إجمالي الدورات',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'إجمالي الطلاب',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الإيرادات',
      value: `${stats.totalRevenue.toLocaleString()} جنيه`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'متوسط التقييم',
      value: stats.averageRating.toFixed(1),
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300 overflow-y-auto scrollbar-custom ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">لوحة التحكم</span>
          </Link>

          {/* User Info */}
          <div className="mb-8 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-600">{user?.role === 'admin' ? 'مدير' : 'مدرس'}</div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">الملف الشخصي</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">الإعدادات</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-semibold"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>الرئيسية</span>
            </Link>
            <Link
              href="/dashboard/courses"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>الدورات</span>
            </Link>
            <Link
              href="/dashboard/quizzes"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <FileQuestion className="w-5 h-5" />
              <span>الاختبارات</span>
            </Link>
            <Link
              href="/categories"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>الفئات</span>
            </Link>
            {user?.role !== 'admin' && (
              <Link
                href="/dashboard/students"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>الطلاب</span>
              </Link>
            )}
            <Link
              href="/chat"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>المحادثات</span>
            </Link>
            <Link
              href="/dashboard/certificates"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <Award className="w-5 h-5" />
              <span>الشهادات</span>
            </Link>
            
            {/* Admin Only Links */}
            {user?.role === 'admin' && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase">إدارة المنصة</div>
                </div>
                <Link
                  href="/dashboard/admin/instructors"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>المعلمين</span>
                </Link>
                <Link
                  href="/dashboard/admin/enrollments"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>التسجيلات</span>
                  {notifications.filter(n => n.type === 'enrollment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'enrollment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/payments"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>المدفوعات</span>
                  {notifications.filter(n => n.type === 'payment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'payment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/students"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>إدارة الطلاب</span>
                </Link>
                <Link
                  href="/dashboard/admin/bundles"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>حزم الدورات</span>
                </Link>
                <Link
                  href="/dashboard/admin/coupons"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Award className="w-5 h-5" />
                  <span>الكوبونات</span>
                </Link>
                <Link
                  href="/dashboard/admin/payment-gateways"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>بوابات الدفع</span>
                </Link>
                <Link
                  href="/dashboard/admin/analytics"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>التحليلات</span>
                </Link>
                <Link
                  href="/dashboard/admin/quizzes"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <FileQuestion className="w-5 h-5" />
                  <span>الاختبارات</span>
                </Link>
                <Link
                  href="/dashboard/admin/overview"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>لوحة التحكم المتقدمة</span>
                </Link>
                <Link
                  href="/dashboard/admin/community"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>إدارة المجتمع</span>
                </Link>
                <Link
                  href="/dashboard/admin/projects"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>إدارة المشروعات</span>
                </Link>
                <Link
                  href="/dashboard/admin/certificates"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Award className="w-5 h-5" />
                  <span>إدارة الشهادات</span>
                </Link>
                <Link
                  href="/dashboard/admin/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>إعدادات المنصة</span>
                </Link>
                <Link
                  href="/dashboard/admin/notifications"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>إدارة الإشعارات</span>
                </Link>
                <Link
                  href="/dashboard/admin/backup"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>النسخ الاحتياطي</span>
                </Link>
                <Link
                  href="/dashboard/admin/activity-logs"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  <span>سجل النشاطات</span>
                </Link>
              </>
            )}
            
            <div className="pt-4"></div>
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>الإعدادات</span>
            </Link>
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              setSidebarOpen(false)
              handleLogout()
            }}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:mr-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-gray-600">
            إليك نظرة عامة على منصتك التعليمية
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/courses/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
            >
              <Plus className="w-6 h-6 text-primary-600" />
              <span className="font-semibold text-gray-700">إضافة دورة جديدة</span>
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
            >
              <BookOpen className="w-6 h-6 text-primary-600" />
              <span className="font-semibold text-gray-700">إدارة الدورات</span>
            </Link>
            {user?.role !== 'admin' && (
              <Link
                href="/dashboard/students"
                className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
              >
                <Users className="w-6 h-6 text-primary-600" />
                <span className="font-semibold text-gray-700">عرض الطلاب</span>
              </Link>
            )}
            
            {/* Admin Quick Actions */}
            {user?.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/admin/instructors"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all"
                >
                  <UserPlus className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-700">إضافة معلم</span>
                </Link>
                <Link
                  href="/dashboard/admin/enrollments"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-700">مراجعة التسجيلات</span>
                  {notifications.filter(n => n.type === 'enrollment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'enrollment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/payments"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-700">مراجعة المدفوعات</span>
                  {notifications.filter(n => n.type === 'payment').length > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.type === 'payment').length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/admin/students"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  <span className="font-semibold text-gray-700">تسجيل طالب يدوياً</span>
                </Link>
                <Link
                  href="/dashboard/admin/bundles"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition-all"
                >
                  <Package className="w-6 h-6 text-pink-600" />
                  <span className="font-semibold text-gray-700">حزم الدورات</span>
                </Link>
                <Link
                  href="/dashboard/admin/coupons"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Award className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-700">إدارة الكوبونات</span>
                </Link>
                <Link
                  href="/dashboard/admin/payment-gateways"
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-all"
                >
                  <CreditCard className="w-6 h-6 text-teal-600" />
                  <span className="font-semibold text-gray-700">بوابات الدفع</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">النشاط الأخير</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
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
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
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
      </main>
    </div>
  )
}
