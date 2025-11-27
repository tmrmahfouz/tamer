'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Clock, ChevronLeft, X } from 'lucide-react'

interface UpNextLessonProps {
  courseId: string
  currentLessonId: string
  lessons: any[]
  autoPlayDelay?: number // بالثواني
  onAutoPlay?: () => void
}

export default function UpNextLesson({
  courseId,
  currentLessonId,
  lessons,
  autoPlayDelay = 10,
  onAutoPlay,
}: UpNextLessonProps) {
  const [countdown, setCountdown] = useState(autoPlayDelay)
  const [isVisible, setIsVisible] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const currentIndex = lessons.findIndex(l => l._id === currentLessonId)
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  useEffect(() => {
    if (!nextLesson || isCancelled) return

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onAutoPlay) onAutoPlay()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [nextLesson, isCancelled, onAutoPlay])

  const handleCancel = () => {
    setIsCancelled(true)
    setCountdown(0)
  }

  if (!nextLesson) return null

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 md:p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">الدرس التالي</span>
            {!isCancelled && countdown > 0 && (
              <span className="px-2 py-0.5 bg-primary-600 rounded-full text-xs">
                يبدأ خلال {countdown} ثانية
              </span>
            )}
          </div>
          
          <h4 className="font-bold text-lg mb-2">{nextLesson.title}</h4>
          
          {nextLesson.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {nextLesson.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            {nextLesson.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {nextLesson.duration} دقيقة
              </span>
            )}
            <span>الدرس {currentIndex + 2} من {lessons.length}</span>
          </div>
        </div>

        {/* Progress Ring */}
        {!isCancelled && countdown > 0 && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#374151"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={175.93}
                strokeDashoffset={175.93 * (countdown / autoPlayDelay)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{countdown}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <Link
          href={`/learn/${courseId}/${nextLesson._id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
        >
          <Play className="w-5 h-5" />
          <span>تشغيل الآن</span>
        </Link>
        
        {!isCancelled && countdown > 0 && (
          <button
            onClick={handleCancel}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
