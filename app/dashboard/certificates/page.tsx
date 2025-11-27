'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { 
  Award, Search, Eye, Trash2, Download, 
  Calendar, User, BookOpen, Filter, RefreshCw,
  CheckCircle, XCircle, AlertCircle, ArrowRight
} from 'lucide-react'

interface Certificate {
  _id: string
  student: {
    _id: string
    name: string
    email: string
  }
  course: {
    _id: string
    title: string
    image: string
  }
  certificateNumber: string
  verificationCode: string
  issuedAt: string
  grade: number
}

export default function CertificatesManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success && (data.user.role === 'admin' || data.user.role === 'instructor')) {
        setUser(data.user)
        loadCertificates(data.user)
        loadCourses(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadCertificates = async (currentUser: any) => {
    try {
      const url = currentUser.role === 'admin' 
        ? '/api/admin/certificates' 
        : '/api/admin/certificates?instructorOnly=true'
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setCertificates(data.certificates)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async (currentUser: any) => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        // Filter courses for instructor
        if (currentUser.role === 'instructor') {
          setCourses(data.courses.filter((c: any) => c.instructor === currentUser.id))
        } else {
          setCourses(data.courses)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (certId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return

    setDeleting(certId)
    try {
      const response = await fetch(`/api/admin/certificates/${certId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setCertificates(certificates.filter(c => c._id !== certId))
        alert('تم حذف الشهادة بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = !filterCourse || cert.course?._id === filterCourse

    return matchesSearch && matchesCourse
  })

  // Stats
  const stats = {
    total: certificates.length,
    thisMonth: certificates.filter(c => {
      const issued = new Date(c.issuedAt)
      const now = new Date()
      return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
    }).length,
    uniqueStudents: new Set(certificates.map(c => c.student?._id)).size,
    uniqueCourses: new Set(certificates.map(c => c.course?._id)).size,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة التحكم</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الشهادات 🏆</h1>
            <p className="text-gray-600">عرض وإدارة جميع الشهادات الصادرة</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">إجمالي الشهادات</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
                  <div className="text-sm text-gray-600">هذا الشهر</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.uniqueStudents}</div>
                  <div className="text-sm text-gray-600">طالب حاصل على شهادة</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.uniqueCourses}</div>
                  <div className="text-sm text-gray-600">دورة لها شهادات</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث بالاسم، البريد، أو رقم الشهادة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>
              </div>

              {/* Course Filter */}
              <div className="min-w-[200px]">
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="">جميع الدورات</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={() => user && loadCertificates(user)}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredCertificates.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد شهادات</h3>
                <p className="text-gray-600">لم يتم إصدار أي شهادات بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الطالب</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الدورة</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">رقم الشهادة</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الدرجة</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">تاريخ الإصدار</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{cert.student?.name || 'غير معروف'}</div>
                            <div className="text-sm text-gray-500">{cert.student?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{cert.course?.image || '📚'}</span>
                            <span className="font-medium text-gray-900">{cert.course?.title || 'غير معروف'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {cert.certificateNumber}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            cert.grade >= 90 ? 'bg-green-100 text-green-700' :
                            cert.grade >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {cert.grade}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(cert.issuedAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/certificates/${cert._id}`}
                              target="_blank"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="عرض الشهادة"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/certificates/verify/${cert.verificationCode}`
                                navigator.clipboard.writeText(url)
                                alert('تم نسخ رابط التحقق!')
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="نسخ رابط التحقق"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(cert._id)}
                                disabled={deleting === cert._id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="حذف الشهادة"
                              >
                                {deleting === cert._id ? (
                                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            عرض {filteredCertificates.length} من {certificates.length} شهادة
          </div>
        </div>
      </section>
    </main>
  )
}
