'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Star,
  Clock,
  Menu,
  X,
  Home,
  LogOut,
} from 'lucide-react'

export default function CoursesManagementPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        
        if (data.user.role !== 'admin' && data.user.role !== 'instructor') {
          router.push('/')
          return
        }
        
        loadCourses()
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setCourses(courses.filter((c) => c._id !== courseId))
        alert('تم حذف الدورة بنجاح')
      } else {
        alert(data.message || 'حدث خطأ أثناء حذف الدورة')
      }
    } catch (error) {
      alert('حدث خطأ أثناء حذف الدورة')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
          <h1 className="font-bold text-gray-900">إدارة الدورات</h1>
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
        fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">لوحة التحكم</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>الرئيسية</span>
            </Link>
            <Link
              href="/dashboard/courses"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-semibold"
            >
              <BookOpen className="w-5 h-5" />
              <span>الدورات</span>
            </Link>
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
                  <p className="text-xs text-gray-500">{user.role === 'admin' ? 'مدير' : 'معلم'}</p>
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
      <main className="md:mr-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              إدارة الدورات
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              عرض وإدارة جميع الدورات التدريبية
            </p>
          </div>
          <Link
            href="/dashboard/courses/new"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة دورة جديدة</span>
          </Link>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد دورات بعد
            </h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإضافة دورتك الأولى
            </p>
            <Link href="/dashboard/courses/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>إضافة دورة</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card">
                {/* Course Image */}
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 h-32 md:h-40 flex items-center justify-center text-5xl md:text-6xl">
                  {course.image}
                </div>

                <div className="p-4 md:p-6">
                  {/* Level Badge */}
                  <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs md:text-sm font-semibold mb-3">
                    {course.level}
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-lg md:text-xl font-bold text-primary-600 mb-4">
                    {course.price} جنيه
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    {course.published ? (
                      <span className="inline-flex items-center gap-1 text-xs md:text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <Eye className="w-4 h-4" />
                        منشورة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        مسودة
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/courses/${course._id}/modules`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-colors font-semibold text-xs md:text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>إدارة المحتوى</span>
                      </Link>
                      <Link
                        href={`/courses/${course._id}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold"
                        title="معاينة كطالب"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/courses/${course._id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-xs md:text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>تعديل</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
