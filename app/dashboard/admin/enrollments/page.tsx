'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, CheckCircle, XCircle, Clock, DollarSign, Search, Filter, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments')
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('هل تريد الموافقة على هذا التسجيل؟')) return

    try {
      const response = await fetch(`/api/admin/enrollments/${id}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await loadEnrollments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error approving enrollment:', error)
      alert('حدث خطأ')
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('هل تريد رفض هذا التسجيل؟')) return

    try {
      const response = await fetch(`/api/admin/enrollments/${id}/reject`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await loadEnrollments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error rejecting enrollment:', error)
      alert('حدث خطأ')
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'active').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة التسجيلات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة التسجيلات">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إدارة التسجيلات
          </h1>
          <p className="text-gray-600">
            عرض وإدارة تسجيلات الطلاب في الدورات
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التسجيلات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">قيد الانتظار</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مفعّلة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مرفوضة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن طالب أو دورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="active">مفعّلة</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    الطالب
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    الدورة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    السعر
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {enrollment.student?.name?.charAt(0) || '؟'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {enrollment.student?.name || 'غير محدد'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enrollment.student?.email || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {enrollment.course?.title || 'غير محدد'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{enrollment.course?.price || 0} جنيه</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                          قيد الانتظار
                        </span>
                      )}
                      {enrollment.status === 'active' && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                          مفعّل
                        </span>
                      )}
                      {enrollment.status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                          مرفوض
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(enrollment._id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="موافقة"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(enrollment._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="رفض"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {enrollment.status !== 'pending' && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد تسجيلات'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
