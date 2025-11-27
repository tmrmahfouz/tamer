'use client'

import { useState, useEffect } from 'react'
import { 
  Award, Search, Filter, Download, Eye, Trash2, 
  RefreshCw, CheckCircle, XCircle, Calendar, User,
  BookOpen, Loader2, MoreVertical, Mail
} from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

interface Certificate {
  _id: string
  uniqueId: string
  student: {
    _id: string
    name: string
    email: string
  }
  course: {
    _id: string
    title: string
  }
  completionDate: string
  issuedAt: string
  status: 'active' | 'revoked'
  grade?: number
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    thisMonth: 0
  })

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/admin/certificates')
      const data = await res.json()
      if (data.success) {
        setCertificates(data.certificates)
        calculateStats(data.certificates)
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (certs: Certificate[]) => {
    const now = new Date()
    const thisMonth = certs.filter(c => {
      const issued = new Date(c.issuedAt)
      return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
    })

    setStats({
      total: certs.length,
      active: certs.filter(c => c.status === 'active').length,
      revoked: certs.filter(c => c.status === 'revoked').length,
      thisMonth: thisMonth.length
    })
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه الشهادة؟')) return

    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' })
      })

      if (res.ok) {
        fetchCertificates()
      }
    } catch (error) {
      console.error('Error revoking certificate:', error)
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      if (res.ok) {
        fetchCertificates()
      }
    } catch (error) {
      console.error('Error reactivating certificate:', error)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout title="إدارة الشهادات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الشهادات">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="w-7 h-7 text-yellow-500" />
            إدارة الشهادات
          </h1>
          <p className="text-gray-600 mt-1">عرض وإدارة شهادات إتمام الدورات</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">إجمالي الشهادات</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">نشطة</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.revoked}</p>
              <p className="text-sm text-gray-600">ملغاة</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              <p className="text-sm text-gray-600">هذا الشهر</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، الدورة، أو رقم الشهادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة</option>
            <option value="revoked">ملغاة</option>
          </select>
          <button
            onClick={fetchCertificates}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">رقم الشهادة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">الطالب</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">الدورة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">تاريخ الإصدار</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد شهادات</p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-primary-600">
                        {cert.uniqueId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cert.student?.name || 'غير معروف'}</p>
                          <p className="text-xs text-gray-500">{cert.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{cert.course?.title || 'غير معروف'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(cert.issuedAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        cert.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {cert.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            نشطة
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            ملغاة
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/certificates/${cert._id}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="عرض الشهادة"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {cert.status === 'active' ? (
                          <button
                            onClick={() => handleRevoke(cert._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="إلغاء الشهادة"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(cert._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="إعادة تفعيل"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
