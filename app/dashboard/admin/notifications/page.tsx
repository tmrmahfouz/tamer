'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, Send, Users, BookOpen, Trash2, 
  CheckCircle, Clock, Filter, Search, Plus,
  Mail, MessageSquare, Loader2, X
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  targetType: 'all' | 'students' | 'instructors' | 'specific'
  targetUsers?: string[]
  sentAt: string
  readBy: string[]
  createdBy: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetType: 'all' as const
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      })

      if (res.ok) {
        alert('✅ تم إرسال الإشعار بنجاح')
        setShowCreateModal(false)
        setNewNotification({ title: '', message: '', type: 'info', targetType: 'all' })
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ حدث خطأ')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const typeColors = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة الإشعارات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الإشعارات">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-7 h-7 text-primary-600" />
              إدارة الإشعارات
            </h1>
            <p className="text-gray-600 mt-1">إرسال إشعارات للمستخدمين</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إشعار جديد
          </button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-sm text-gray-600">إجمالي الإشعارات</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {notifications.filter(n => n.targetType === 'all').length}
              </p>
              <p className="text-sm text-gray-600">للجميع</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">الإشعارات المرسلة</h2>
        </div>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[notification.type]}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {notification.targetType === 'all' ? 'الجميع' : 
                         notification.targetType === 'students' ? 'الطلاب' : 'المعلمين'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.sentAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">إرسال إشعار جديد</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="عنوان الإشعار"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="محتوى الإشعار"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="info">معلومات</option>
                    <option value="success">نجاح</option>
                    <option value="warning">تحذير</option>
                    <option value="error">خطأ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المستهدفون</label>
                  <select
                    value={newNotification.targetType}
                    onChange={(e) => setNewNotification({ ...newNotification, targetType: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">الجميع</option>
                    <option value="students">الطلاب فقط</option>
                    <option value="instructors">المعلمين فقط</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
