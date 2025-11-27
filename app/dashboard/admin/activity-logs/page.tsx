'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function ActivityLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [filters, setFilters] = useState({
    type: '',
    entity: '',
    search: '',
  })

  useEffect(() => {
    checkAuth()
    loadLogs()
  }, [page, filters.type, filters.entity])

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

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.type && { type: filters.type }),
        ...(filters.entity && { entity: filters.entity }),
      })

      const response = await fetch(`/api/admin/activity-logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (type: string) => {
    const icons: any = {
      create: Plus,
      update: Edit,
      delete: Trash2,
      view: Eye,
      login: LogIn,
      logout: LogOut,
      download: Download,
    }
    return icons[type] || Activity
  }

  const getActionColor = (type: string) => {
    const colors: any = {
      create: 'text-green-600 bg-green-100',
      update: 'text-blue-600 bg-blue-100',
      delete: 'text-red-600 bg-red-100',
      view: 'text-purple-600 bg-purple-100',
      login: 'text-indigo-600 bg-indigo-100',
      logout: 'text-gray-600 bg-gray-100',
      download: 'text-orange-600 bg-orange-100',
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  const getActionText = (type: string) => {
    const texts: any = {
      create: 'إنشاء',
      update: 'تحديث',
      delete: 'حذف',
      view: 'عرض',
      login: 'تسجيل دخول',
      logout: 'تسجيل خروج',
      download: 'تنزيل',
      other: 'أخرى',
    }
    return texts[type] || type
  }

  if (loading && logs.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل الأنشطة</h1>
        <p className="text-gray-600">تتبع جميع الأنشطة والعمليات في المنصة</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              نوع النشاط
            </label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value })
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="">الكل</option>
              <option value="create">إنشاء</option>
              <option value="update">تحديث</option>
              <option value="delete">حذف</option>
              <option value="view">عرض</option>
              <option value="login">تسجيل دخول</option>
              <option value="logout">تسجيل خروج</option>
              <option value="download">تنزيل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              الكيان
            </label>
            <select
              value={filters.entity}
              onChange={(e) => {
                setFilters({ ...filters, entity: e.target.value })
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="">الكل</option>
              <option value="User">مستخدم</option>
              <option value="Course">دورة</option>
              <option value="Enrollment">تسجيل</option>
              <option value="Payment">دفعة</option>
              <option value="Coupon">كوبون</option>
              <option value="SupportTicket">تذكرة دعم</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              بحث
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="ابحث في الأنشطة..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النوع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النشاط</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الكيان</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التفاصيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs
                .filter(log => 
                  !filters.search || 
                  log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
                  log.user?.name?.toLowerCase().includes(filters.search.toLowerCase())
                )
                .map((log) => {
                  const Icon = getActionIcon(log.type)
                  const colorClass = getActionColor(log.type)

                  return (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{getActionText(log.type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user?.name}</div>
                          <div className="text-xs text-gray-600">{log.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{log.entity}</span>
                      </td>
                      <td className="px-6 py-4">
                        {log.details && (
                          <div className="text-xs text-gray-600 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(log.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(log.createdAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد أنشطة</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              عرض {((page - 1) * pagination.limit) + 1} - {Math.min(page * pagination.limit, pagination.total)} من {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 font-semibold text-gray-900">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
