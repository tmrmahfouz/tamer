'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react'

export default function SessionManager() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()

      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    if (!confirm('هل تريد إنهاء هذه الجلسة؟')) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        loadSessions()
        alert('تم إنهاء الجلسة')
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const terminateAllSessions = async () => {
    if (!confirm('هل تريد إنهاء جميع الجلسات الأخرى؟')) return

    try {
      const response = await fetch('/api/sessions/terminate-all', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        loadSessions()
        alert('تم إنهاء جميع الجلسات الأخرى')
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-6 h-6" />
      case 'tablet':
        return <Tablet className="w-6 h-6" />
      default:
        return <Monitor className="w-6 h-6" />
    }
  }

  const formatLastActivity = (date: string) => {
    const now = new Date()
    const activity = new Date(date)
    const diffMs = now.getTime() - activity.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    return `منذ ${diffDays} يوم`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              إدارة الجلسات
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              الأجهزة المتصلة بحسابك
            </p>
          </div>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={terminateAllSessions}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>إنهاء جميع الجلسات الأخرى</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          <strong>نصيحة أمنية:</strong> إذا رأيت جلسة لا تعرفها، قم بإنهائها فوراً وغيّر كلمة المرور.
        </p>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد جلسات نشطة</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session._id}
              className={`p-6 rounded-xl border-2 transition-all ${
                session.isCurrent
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  session.isCurrent
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {getDeviceIcon(session.deviceInfo.deviceType)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {session.deviceInfo.device}
                        </h3>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            الجلسة الحالية
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.deviceInfo.browser} • {session.deviceInfo.os}
                      </p>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => terminateSession(session._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        إنهاء الجلسة
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {session.location?.city}, {session.location?.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>آخر نشاط: {formatLastActivity(session.lastActivity)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>IP: {session.ipAddress}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    تم الاتصال: {new Date(session.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">جلسات نشطة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sessions.filter(s => s.deviceInfo.deviceType === 'desktop').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">سطح المكتب</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sessions.filter(s => s.deviceInfo.deviceType === 'mobile').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">موبايل</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sessions.filter(s => s.deviceInfo.deviceType === 'tablet').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">تابلت</div>
          </div>
        </div>
      </div>
    </div>
  )
}
