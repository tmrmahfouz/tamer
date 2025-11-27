'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, X, Calendar } from 'lucide-react'

export default function RemindersWidget() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()

      if (data.success) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        loadReminders()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getTimeUntil = (date: string) => {
    const now = new Date()
    const scheduled = new Date(date)
    const diffMs = scheduled.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) return `خلال ${diffDays} يوم`
    if (diffHours > 0) return `خلال ${diffHours} ساعة`
    return 'قريباً'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📝'
      case 'course_completion':
        return '🎓'
      case 'streak':
        return '🔥'
      case 'lesson':
        return '📚'
      case 'subscription':
        return '💳'
      case 'live_session':
        return '🎥'
      default:
        return '🔔'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (reminders.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">
          التذكيرات القادمة
        </h3>
        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-semibold">
          {reminders.length}
        </span>
      </div>

      <div className="space-y-2">
        {reminders.slice(0, 5).map((reminder) => (
          <div
            key={reminder._id}
            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {reminder.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {reminder.message}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeUntil(reminder.scheduledFor)}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(reminder.scheduledFor).toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => cancelReminder(reminder._id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="إلغاء التذكير"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {reminders.length > 5 && (
        <button className="w-full mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold">
          عرض جميع التذكيرات ({reminders.length})
        </button>
      )}
    </div>
  )
}
