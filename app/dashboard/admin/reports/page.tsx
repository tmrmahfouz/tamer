'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react'

export default function AdminReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [filters, setFilters] = useState({
    type: 'overview',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    checkAuth()
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

  const generateReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: filters.type,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      const data = await response.json()

      if (data.success) {
        setReportData(data)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format: string) => {
    try {
      const params = new URLSearchParams({
        type: filters.type,
        format,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${filters.type}-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('حدث خطأ')
    }
  }

  const reportTypes = [
    { value: 'overview', label: 'نظرة عامة', icon: BarChart3, color: 'blue' },
    { value: 'revenue', label: 'الإيرادات', icon: DollarSign, color: 'green' },
    { value: 'students', label: 'الطلاب', icon: Users, color: 'purple' },
    { value: 'courses', label: 'الدورات', icon: BookOpen, color: 'orange' },
    { value: 'enrollments', label: 'التسجيلات', icon: FileText, color: 'pink' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h1>
        <p className="text-gray-600">إنشاء وتصدير تقارير مفصلة عن المنصة</p>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => setFilters({ ...filters, type: type.value })}
              className={`p-6 rounded-xl transition-all ${
                filters.type === type.value
                  ? `bg-${type.color}-600 text-white shadow-lg scale-105`
                  : 'bg-white text-gray-900 hover:shadow-lg'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-semibold">{type.label}</div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">الفلاتر</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Data */}
      {reportData && (
        <div className="space-y-6">
          {/* Export Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تصدير التقرير</h2>
            <div className="flex gap-4">
              <button
                onClick={() => downloadReport('csv')}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>تصدير CSV</span>
              </button>
              <button
                onClick={() => downloadReport('json')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>تصدير JSON</span>
              </button>
            </div>
          </div>

          {/* Overview Report */}
          {filters.type === 'overview' && reportData.data && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  المستخدمون
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي المستخدمين</span>
                    <span className="font-bold text-gray-900">{reportData.data.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الطلاب</span>
                    <span className="font-bold text-blue-600">{reportData.data.users.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المعلمين</span>
                    <span className="font-bold text-green-600">{reportData.data.users.instructors}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  الدورات
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الدورات</span>
                    <span className="font-bold text-gray-900">{reportData.data.courses.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط السعر</span>
                    <span className="font-bold text-orange-600">
                      {reportData.data.courses.averagePrice.toFixed(0)} جنيه
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  التسجيلات
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي التسجيلات</span>
                    <span className="font-bold text-purple-600">{reportData.data.enrollments}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  الإيرادات
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الإيرادات</span>
                    <span className="font-bold text-green-600">
                      {reportData.data.revenue.total.toLocaleString()} جنيه
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط الإيراد</span>
                    <span className="font-bold text-gray-900">
                      {reportData.data.revenue.average.toFixed(0)} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Report */}
          {filters.type === 'revenue' && reportData.data && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</div>
                  <div className="text-3xl font-bold text-green-600">
                    {reportData.data.totalRevenue.toLocaleString()} جنيه
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">عدد المعاملات</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.data.totalTransactions}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">متوسط المعاملة</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {reportData.data.averageTransaction.toFixed(0)} جنيه
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">آخر المدفوعات</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">المستخدم</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الدورة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">المبلغ</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.data.recentPayments.slice(0, 10).map((payment: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.user?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.course?.title}</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">
                            {payment.amount} جنيه
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Report Metadata */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>تم الإنشاء في: {new Date(reportData.generatedAt).toLocaleString('ar-EG')}</span>
              </div>
              <div>
                نوع التقرير: <span className="font-semibold">{reportData.reportType}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لم يتم إنشاء تقرير بعد</h3>
          <p className="text-gray-600">اختر نوع التقرير والفترة الزمنية ثم اضغط على "إنشاء التقرير"</p>
        </div>
      )}
    </div>
  )
}
