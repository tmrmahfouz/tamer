'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function StudentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadStudentData()
  }, [studentId])

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

  const loadStudentData = async () => {
    try {
      setLoading(true)

      // Load student info
      const studentRes = await fetch(`/api/users/${studentId}`)
      const studentData = await studentRes.json()

      if (studentData.success) {
        setStudent(studentData.user)
      }

      // Load enrollments
      const enrollRes = await fetch(`/api/enrollments?studentId=${studentId}`)
      const enrollData = await enrollRes.json()

      if (enrollData.success) {
        setEnrollments(enrollData.enrollments || [])
      }

      // Load payments
      const paymentRes = await fetch(`/api/payments?userId=${studentId}`)
      const paymentData = await paymentRes.json()

      if (paymentData.success) {
        setPayments(paymentData.payments || [])
      }
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الطالب غير موجود</h2>
          <Link href="/dashboard/admin/students">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              العودة للطلاب
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const completedCourses = enrollments.filter(
    (e) => e.completionPercentage === 100
  ).length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/admin/students">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>العودة للطلاب</span>
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطالب</h1>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>انضم في {new Date(student.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">الدورات المسجلة</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{enrollments.length}</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">الدورات المكتملة</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedCourses}</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">إجمالي المدفوعات</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalSpent.toLocaleString('ar-EG')} جنيه
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">معدل الإكمال</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {enrollments.length > 0
                ? Math.round(
                    enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
                      enrollments.length
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">الدورات المسجلة</h2>
        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {enrollment.course?.title || 'دورة محذوفة'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          enrollment.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enrollment.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {enrollment.completionPercentage || 0}%
                    </div>
                    <div className="text-xs text-gray-600">نسبة الإكمال</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.completionPercentage || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد دورات مسجلة</p>
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">سجل المدفوعات</h2>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الدورة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الطريقة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{payment.course?.title || 'دورة محذوفة'}</td>
                    <td className="py-3 px-4 font-semibold">
                      {payment.amount.toLocaleString('ar-EG')} جنيه
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {payment.method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status === 'completed'
                          ? 'مكتمل'
                          : payment.status === 'pending'
                          ? 'معلق'
                          : 'مرفوض'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد مدفوعات</p>
          </div>
        )}
      </div>
    </div>
  )
}
