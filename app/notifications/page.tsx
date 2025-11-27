'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Bell, Check, Trash2, Filter } from 'lucide-react'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const url = filter === 'unread' ? '/api/notifications?unreadOnly=true' : '/api/notifications'
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      })
      loadNotifications()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      loadNotifications()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      loadNotifications()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      course: '📚',
      lesson: '📖',
      review: '⭐',
      certificate: '🎓',
      coupon: '🎫',
      system: '🔔',
    }
    return icons[type] || '🔔'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              <Bell className="w-8 h-8" />
              <span>الإشعارات</span>
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  غير المقروءة
                </button>
              </div>

              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span>وضع علامة مقروء على الكل</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' ? 'جميع الإشعارات مقروءة' : 'لم تتلق أي إشعارات بعد'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-all hover:shadow-lg ${
                    !notification.read
                      ? 'border-r-4 border-primary-600'
                      : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="text-4xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full">
                            جديد
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <div className="flex gap-3">
                          {notification.link && (
                            <button
                              onClick={() => router.push(notification.link)}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                            >
                              عرض التفاصيل
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>مقروء</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
