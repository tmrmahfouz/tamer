'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Clock, BookOpen } from 'lucide-react'

interface WatchingItem {
  lessonId: string
  lessonTitle: string
  courseId: string
  courseTitle: string
  courseThumbnail: string
  lastPosition: number
  duration: number
  watchedPercentage: number
  lastWatchedAt: string
}

export default function ContinueWatching() {
  const [items, setItems] = useState<WatchingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContinueWatching()
  }, [])

  const loadContinueWatching = async () => {
    try {
      const res = await fetch('/api/continue-watching')
      const data = await res.json()
      if (data.success) {
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error loading continue watching:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'اليوم'
    if (days === 1) return 'أمس'
    if (days < 7) return `منذ ${days} أيام`
    return date.toLocaleDateString('ar-EG')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Play className="w-5 h-5 text-primary-600" />
        استئناف المشاهدة
      </h3>

      <div className="space-y-4">
        {items.slice(0, 3).map((item) => (
          <Link
            key={`${item.courseId}-${item.lessonId}`}
            href={`/learn/${item.courseId}/${item.lessonId}`}
            className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            {/* Thumbnail */}
            <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {item.courseThumbnail ? (
                <img src={item.courseThumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                  <BookOpen className="w-8 h-8 text-primary-400" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-600 ml-0.5" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                <div 
                  className="h-full bg-primary-600"
                  style={{ width: `${item.watchedPercentage}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                {item.lessonTitle}
              </h4>
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                {item.courseTitle}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(item.lastPosition)} / {formatTime(item.duration)}
                </span>
                <span>{formatDate(item.lastWatchedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 3 && (
        <Link 
          href="/student/my-courses"
          className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium"
        >
          عرض الكل ({items.length})
        </Link>
      )}
    </div>
  )
}
