'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Award,
  DollarSign,
  Eye,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Student {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  enrollments?: number
  completedCourses?: number
  totalSpent?: number
}

export default function AdminStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const [enrollData, setEnrollData] = useState({
    courseId: '',
    paymentAmount: 0,
    paymentMethod: 'manual',
    notes: '',
  })

  useEffect(() => {
    checkAuth()
    loadStudents()
    loadCourses()
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

  const loadStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/students', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const data = await response.json()

      console.log('📊 بيانات الطلاب المستلمة:', data)
      console.log('📈 الإحصائيات:', data.stats)

      // Check for JWT signature error
      if (!data.success && data.error && data.error.includes('signature')) {
        console.log('🔑 خطأ في التوكن - مسح الكوكيز وإعادة التوجيه...')
        // Clear all cookies
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim()
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        })
        // Redirect to login
        window.location.href = '/login'
        return
      }

      if (data.success) {
        setStudents(data.students)
        setStats(data.stats)
        console.log('✅ تم تحديث الحالة:', {
          students: data.students.length,
          stats: data.stats
        })
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الطلاب:', error)
    } finally {
      setLoading(false)
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('تم إضافة الطالب بنجاح')
        setShowModal(false)
        resetForm()
        loadStudents()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('حدث خطأ')
    }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent || !enrollData.courseId) {
      alert('الرجاء اختيار دورة')
      return
    }

    try {
      const response = await fetch('/api/admin/enrollments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          courseId: enrollData.courseId,
          paymentAmount: enrollData.paymentAmount,
          paymentMethod: enrollData.paymentMethod,
          notes: enrollData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('تم تسجيل الطالب في الدورة بنجاح')
        setShowEnrollModal(false)
        setSelectedStudent(null)
        resetEnrollForm()
        loadStudents()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('حدث خطأ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return

    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('تم حذف الطالب بنجاح')
        loadStudents()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('حدث خطأ')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
    })
  }

  const resetEnrollForm = () => {
    setEnrollData({
      courseId: '',
      paymentAmount: 0,
      paymentMethod: 'manual',
      notes: '',
    })
  }

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout title="إدارة الطلاب">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الطلاب">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلاب</h1>
          <p className="text-gray-600">إدارة شاملة لجميع الطلاب المسجلين</p>
        </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">إجمالي الطلاب</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
          <div className="text-sm text-gray-600">طلاب نشطون</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.newThisMonth}</div>
          <div className="text-sm text-gray-600">جدد هذا الشهر</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الطالب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الهاتف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الدورات</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {student.phone || 'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">
                        {student.enrollments || 0} دورة
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowEnrollModal(true)
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="تسجيل في دورة"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/admin/students/${student._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا يوجد طلاب</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">إضافة طالب جديد</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  placeholder="+20 123 456 7890"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                تسجيل {selectedStudent.name} في دورة
              </h2>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الدورة *
                </label>
                <select
                  value={enrollData.courseId}
                  onChange={(e) => {
                    const course = courses.find(c => c._id === e.target.value)
                    setEnrollData({ 
                      ...enrollData, 
                      courseId: e.target.value,
                      paymentAmount: course?.price || 0
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                >
                  <option value="">اختر دورة</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} - {course.price} جنيه
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  المبلغ المدفوع *
                </label>
                <input
                  type="number"
                  value={enrollData.paymentAmount}
                  onChange={(e) => setEnrollData({ ...enrollData, paymentAmount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  طريقة الدفع *
                </label>
                <select
                  value={enrollData.paymentMethod}
                  onChange={(e) => setEnrollData({ ...enrollData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                >
                  <option value="manual">يدوي (Admin)</option>
                  <option value="cash">نقدي</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="instapay">انستاباي</option>
                  <option value="fawry">فوري</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={enrollData.notes}
                  onChange={(e) => setEnrollData({ ...enrollData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 h-24"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  تسجيل في الدورة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollModal(false)
                    setSelectedStudent(null)
                    resetEnrollForm()
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
