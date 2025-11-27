'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, CreditCard, CheckCircle, XCircle, Clock, Search, Download, Eye, X, Phone, FileText, RefreshCw, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadPayments()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPayments()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadPayments = async (silent = false) => {
    if (!silent) setLoading(true)
    
    try {
      const response = await fetch('/api/admin/payments')
      const data = await response.json()

      if (data.success) {
        setPayments(data.payments || [])
      } else {
        console.error('Failed to load payments:', data.message, data.error)
        if (!silent) {
          alert(`فشل تحميل البيانات: ${data.message}${data.error ? '\n' + data.error : ''}`)
        }
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      if (!silent) {
        alert('حدث خطأ في الاتصال بالخادم')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    if (!confirm('هل تريد تأكيد هذه الدفعة؟')) return

    try {
      const response = await fetch(`/api/admin/payments/${id}/verify`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await loadPayments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      alert('حدث خطأ')
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('هل تريد رفض هذه الدفعة؟')) return

    try {
      const response = await fetch(`/api/admin/payments/${id}/reject`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await loadPayments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('حدث خطأ')
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: payments.reduce((acc, p) => acc + (p.amount || 0), 0),
    verified: payments.filter(p => p.status === 'verified').reduce((acc, p) => acc + (p.amount || 0), 0),
    pending: payments.filter(p => p.status === 'pending').length,
    thisMonth: payments.filter(p => {
      const date = new Date(p.createdAt)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).reduce((acc, p) => acc + (p.amount || 0), 0),
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة المدفوعات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة المدفوعات">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة المدفوعات
            </h1>
            <p className="text-gray-600">
              عرض وإدارة جميع المدفوعات والإيرادات
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true)
                loadPayments()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>تصدير التقرير</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total.toLocaleString()} جنيه
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مدفوعات مؤكدة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.verified.toLocaleString()} جنيه
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
                <p className="text-sm text-gray-600 dark:text-gray-400">قيد المراجعة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">هذا الشهر</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.thisMonth.toLocaleString()} جنيه
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

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="verified">مؤكدة</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
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
                    المبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    طريقة الدفع
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                    التاريخ
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
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {payment.user?.name?.charAt(0) || '؟'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {payment.user?.name || 'غير محدد'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.user?.email || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {payment.course?.title || 'غير محدد'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {payment.amount?.toLocaleString()} جنيه
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">
                          {(payment.paymentMethod === 'card' || payment.method === 'card') && 'بطاقة ائتمان'}
                          {(payment.paymentMethod === 'bank' || payment.method === 'bank_transfer') && 'تحويل بنكي'}
                          {(payment.paymentMethod === 'cash' || payment.method === 'cash') && 'كاش'}
                          {(payment.paymentMethod === 'vodafone_cash' || payment.method === 'vodafone-cash' || payment.method === 'vodafone_cash') && 'فودافون كاش'}
                          {(payment.paymentMethod === 'instapay' || payment.method === 'instapay') && 'انستاباي'}
                          {(payment.paymentMethod === 'fawry' || payment.method === 'fawry') && 'فوري'}
                          {(payment.paymentMethod === 'manual' || payment.method === 'manual') && 'يدوي'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                          قيد المراجعة
                        </span>
                      )}
                      {payment.status === 'verified' && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                          مؤكدة
                        </span>
                      )}
                      {payment.status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                          مرفوضة
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowDetailsModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(payment._id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="تأكيد"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(payment._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="رفض"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد مدفوعات'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                تفاصيل الدفع
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  معلومات الطالب
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPayment.user?.name || 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">البريد:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPayment.user?.email || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  معلومات الدورة
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">الدورة:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPayment.course?.title || 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">المبلغ:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                      {selectedPayment.amount?.toLocaleString()} جنيه
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  تفاصيل الدفع
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">طريقة الدفع:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPayment.paymentMethod === 'vodafone_cash' && 'فودافون كاش'}
                      {selectedPayment.paymentMethod === 'instapay' && 'انستاباي'}
                      {selectedPayment.paymentMethod === 'fawry' && 'فوري'}
                      {selectedPayment.paymentMethod === 'bank_transfer' && 'تحويل بنكي'}
                      {selectedPayment.paymentMethod === 'cash' && 'كاش'}
                      {selectedPayment.paymentMethod === 'card' && 'بطاقة ائتمان'}
                    </span>
                  </div>

                  {selectedPayment.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-600 dark:text-gray-400">رقم الهاتف:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedPayment.phoneNumber}
                      </span>
                    </div>
                  )}

                  {selectedPayment.referenceNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-600 dark:text-gray-400">رقم المرجع:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedPayment.referenceNumber}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">التاريخ:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedPayment.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">الحالة:</span>
                    {selectedPayment.status === 'pending' && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        قيد المراجعة
                      </span>
                    )}
                    {selectedPayment.status === 'verified' && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                        مؤكدة
                      </span>
                    )}
                    {selectedPayment.status === 'rejected' && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                        مرفوضة
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Proof Image */}
              {selectedPayment.paymentProof && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    إيصال الدفع
                  </h3>
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={selectedPayment.paymentProof}
                      alt="إيصال الدفع"
                      className="w-full h-auto"
                    />
                  </div>
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>تحميل الإيصال</span>
                  </a>
                </div>
              )}

              {!selectedPayment.paymentProof && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
                  <FileText className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                    لم يتم رفع إيصال الدفع
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedPayment.status === 'pending' && (
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleVerify(selectedPayment._id)
                    setShowDetailsModal(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>تأكيد الدفع</span>
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedPayment._id)
                    setShowDetailsModal(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  <span>رفض الدفع</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
