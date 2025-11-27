'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, Users, Settings, LogOut,
  CreditCard, FileText, BarChart3, GraduationCap, Award,
  MessageCircle, Bell, FileQuestion, FolderKanban, Clock,
  Database, HelpCircle, Menu, X, ChevronRight, Home, Package
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

const menuItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/dashboard/admin/overview', label: 'لوحة التحكم', icon: LayoutDashboard },
  { divider: true, label: 'إدارة المحتوى' },
  { href: '/dashboard/courses', label: 'الدورات', icon: BookOpen },
  { href: '/dashboard/admin/quizzes', label: 'الاختبارات', icon: FileQuestion },
  { href: '/dashboard/admin/projects', label: 'المشروعات', icon: FolderKanban },
  { href: '/dashboard/admin/certificates', label: 'الشهادات', icon: Award },
  { divider: true, label: 'إدارة المستخدمين' },
  { href: '/dashboard/admin/students', label: 'الطلاب', icon: Users },
  { href: '/dashboard/admin/instructors', label: 'المعلمين', icon: GraduationCap },
  { href: '/dashboard/admin/enrollments', label: 'التسجيلات', icon: FileText },
  { divider: true, label: 'المالية' },
  { href: '/dashboard/admin/payments', label: 'المدفوعات', icon: CreditCard },
  { href: '/dashboard/admin/bundles', label: 'حزم الدورات', icon: Package },
  { href: '/dashboard/admin/coupons', label: 'الكوبونات', icon: Award },
  { href: '/dashboard/admin/payment-gateways', label: 'بوابات الدفع', icon: CreditCard },
  { divider: true, label: 'التواصل' },
  { href: '/dashboard/admin/community', label: 'المجتمع', icon: MessageCircle },
  { href: '/dashboard/admin/notifications', label: 'الإشعارات', icon: Bell },
  { divider: true, label: 'النظام' },
  { href: '/dashboard/admin/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/dashboard/admin/activity-logs', label: 'سجل النشاطات', icon: Clock },
  { href: '/dashboard/admin/backup', label: 'النسخ الاحتياطي', icon: Database },
  { href: '/dashboard/admin/faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { href: '/dashboard/admin/settings', label: 'الإعدادات', icon: Settings },
]

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success && data.user.role === 'admin') {
        setUser(data.user)
      } else {
        router.push('/dashboard')
      }
    } catch {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-gray-900">{title || 'لوحة التحكم'}</h1>
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center text-white text-xl">
                🎓
              </div>
              <span className="font-bold text-gray-900">لوحة الأدمن</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={index} className="pt-4 pb-2 px-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {item.label}
                    </span>
                  </div>
                )
              }

              const Icon = item.icon!
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t">
            {user && (
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold">
                    {user.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">مدير</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:mr-64 min-h-screen pt-16 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between bg-white border-b px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/dashboard" className="hover:text-primary-600">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{title || 'لوحة التحكم'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
