'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface ProgressBarProps {
  courseId: string
}

export default function ProgressBar({ courseId }: ProgressBarProps) {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [courseId])

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/progress?courseId=${courseId}`)
      const data = await response.json()

      if (data.success) {
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`
    }
    return `${minutes} دقيقة`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (!progress) return null

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span>تقدمك في الدورة</span>
        </h3>
        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
          {progress.completionPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-primary-600 to-secondary-600 transition-all duration-500 rounded-full"
          style={{ width: `${progress.completionPercentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">الدروس المكتملة</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {progress.completedLessons} / {progress.totalLessons}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">وقت المشاهدة</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatTime(progress.totalWatchTime)}
          </div>
        </div>
      </div>

      {/* Last Watched */}
      {progress.lastWatched && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            آخر درس تمت مشاهدته:
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {progress.lastWatched.lesson?.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {new Date(progress.lastWatched.lastWatchedAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      )}

      {/* Motivational Message */}
      {progress.completionPercentage === 100 ? (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-400 font-bold">
            🎉 مبروك! أكملت الدورة بنجاح
          </p>
        </div>
      ) : progress.completionPercentage >= 75 ? (
        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
          <p className="text-blue-800 dark:text-blue-400 font-semibold">
            💪 أنت قريب جداً من الإكمال!
          </p>
        </div>
      ) : progress.completionPercentage >= 50 ? (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
          <p className="text-yellow-800 dark:text-yellow-400 font-semibold">
            🚀 نصف الطريق! استمر
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-center">
          <p className="text-purple-800 dark:text-purple-400 font-semibold">
            🌟 بداية رائعة! واصل التقدم
          </p>
        </div>
      )}
    </div>
  )
}
